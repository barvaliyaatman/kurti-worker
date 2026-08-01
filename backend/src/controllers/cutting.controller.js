import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createSystemNotification } from '../utils/notificationHelper.js';

export const getCuttingQueue = async (req, res, next) => {
  try {
    const { search, status, sort = 'latest', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: {
        in: ['READY_FOR_CUTTING', 'CUTTING_IN_PROGRESS', 'CUTTING_COMPLETED'],
      },
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { job_card_number: { contains: term, mode: 'insensitive' } },
        { design_code: { contains: term, mode: 'insensitive' } },
      ];
    }

    let orderBy = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    }

    const [jobCards, total] = await Promise.all([
      prisma.jobCard.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          items: true,
          cutting_progress: true,
          bundles: true,
        },
      }),
      prisma.jobCard.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Cutting queue retrieved successfully.',
      data: {
        jobCards,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCuttingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobCard = await prisma.jobCard.findUnique({
      where: { id },
      include: {
        items: true,
        cutting_progress: true,
        bundles: true,
      },
    });

    if (!jobCard) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Job Card not found.',
      });
    }

    // Parse design components
    const componentsList = typeof jobCard.components === 'string'
      ? jobCard.components.split(',')
      : ['Top', 'Pant'];

    // Map component-wise progress for the whole batch
    const componentProgress = componentsList.map((compName) => {
      const prog = jobCard.cutting_progress.find((cp) => cp.component === compName);
      return {
        component: compName,
        status: prog ? prog.status : 'PENDING',
        completed_at: prog ? prog.completed_at : null,
        completed_by: prog ? prog.completed_by : null,
      };
    });

    // Check if ALL components in the design are 100% completed
    const allComponentsCompleted =
      componentProgress.length > 0 &&
      componentProgress.every((c) => c.status === 'COMPLETED');

    const progressPercentage = Math.round(
      (componentProgress.filter((c) => c.status === 'COMPLETED').length /
        componentProgress.length) *
        100
    );

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Cutting details retrieved successfully.',
      data: {
        jobCard,
        component_progress: componentProgress,
        progress_percentage: progressPercentage,
        can_generate_bundles: allComponentsCompleted,
        bundles: jobCard.bundles,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const startCutting = async (req, res, next) => {
  try {
    const { job_card_id } = req.body;

    const jobCard = await prisma.jobCard.findUnique({
      where: { id: job_card_id },
      include: {
        cutting_progress: true,
      },
    });

    if (!jobCard) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Job Card not found.',
      });
    }

    // Parse design components
    const componentsList = typeof jobCard.components === 'string'
      ? jobCard.components.split(',')
      : ['Top', 'Pant'];

    // Initialize component-wise cutting_progress entries
    const progressEntriesToCreate = [];
    componentsList.forEach((compName) => {
      const exists = jobCard.cutting_progress.some((cp) => cp.component === compName);
      if (!exists) {
        progressEntriesToCreate.push({
          job_card_id: jobCard.id,
          component: compName,
          status: 'PENDING',
        });
      }
    });

    if (progressEntriesToCreate.length > 0) {
      await prisma.cuttingProgress.createMany({
        data: progressEntriesToCreate,
        skipDuplicates: true,
      });
    }

    // Transition Job Card status to CUTTING_IN_PROGRESS
    const updatedJobCard = await prisma.jobCard.update({
      where: { id: job_card_id },
      data: {
        status: 'CUTTING_IN_PROGRESS',
      },
      include: {
        cutting_progress: true,
      },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Cutting Started',
      message: `Cutting started for Job Card ${updatedJobCard.job_card_number}.`,
      type: 'CUTTING',
      priority: 'HIGH',
      reference_type: 'JOB_CARD',
      reference_id: updatedJobCard.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Cutting started for Job Card ${updatedJobCard.job_card_number}.`,
      data: { jobCard: updatedJobCard },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateComponentStatus = async (req, res, next) => {
  try {
    const { job_card_id, component, status } = req.body;

    const existingProgress = await prisma.cuttingProgress.findUnique({
      where: {
        job_card_id_component: {
          job_card_id,
          component,
        },
      },
    });

    let updatedProgress;
    if (existingProgress) {
      updatedProgress = await prisma.cuttingProgress.update({
        where: { id: existingProgress.id },
        data: {
          status,
          ...(status === 'COMPLETED' && {
            completed_at: new Date(),
            completed_by: req.user?.full_name || 'Cutting Master',
          }),
        },
      });
    } else {
      updatedProgress = await prisma.cuttingProgress.create({
        data: {
          job_card_id,
          component,
          status,
          ...(status === 'COMPLETED' && {
            completed_at: new Date(),
            completed_by: req.user?.full_name || 'Cutting Master',
          }),
        },
      });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Component '${component}' status set to ${status}.`,
      data: { progress: updatedProgress },
    });
  } catch (error) {
    return next(error);
  }
};

export const completeColorAndGenerateBundle = async (req, res, next) => {
  try {
    const { job_card_id } = req.body;

    const jobCard = await prisma.jobCard.findUnique({
      where: { id: job_card_id },
      include: {
        items: true,
        cutting_progress: true,
        bundles: true,
      },
    });

    if (!jobCard) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Job Card not found.',
      });
    }

    // Verify all components are COMPLETED
    const componentsList = typeof jobCard.components === 'string'
      ? jobCard.components.split(',')
      : ['Top', 'Pant'];

    const completedComponentsCount = jobCard.cutting_progress.filter(
      (cp) => cp.status === 'COMPLETED'
    ).length;

    if (completedComponentsCount < componentsList.length) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'All component batch cutting tasks must be COMPLETED before generating Color + Size bundles.',
      });
    }

    // Generate bundles if not already created
    if (jobCard.bundles.length === 0) {
      const colorShortCodes = {
        Red: 'RD',
        Blue: 'BL',
        Green: 'GR',
        Black: 'BK',
        White: 'WH',
        Yellow: 'YL',
        Pink: 'PK',
      };

      const bundlesToCreate = jobCard.items.map((item) => {
        const colorCode = colorShortCodes[item.color] || item.color.substring(0, 2).toUpperCase();
        const bundleNum = `${jobCard.job_card_number}-${colorCode}-${item.size}`;

        return {
          bundle_number: bundleNum,
          job_card_id: jobCard.id,
          color: item.color,
          size: item.size,
          total_sets: item.quantity,
          assigned_sets: 0,
          completed_sets: 0,
          status: 'READY_FOR_ASSIGNMENT',
        };
      });

      await prisma.bundle.createMany({
        data: bundlesToCreate,
        skipDuplicates: true,
      });

      // Update Job Card status to CUTTING_COMPLETED
      await prisma.jobCard.update({
        where: { id: job_card_id },
        data: { status: 'CUTTING_COMPLETED' },
      });

      // Generate System Notifications
      await createSystemNotification({
        title: 'Cutting Completed',
        message: `Cutting completed for Job Card ${jobCard.job_card_number}.`,
        type: 'CUTTING',
        priority: 'HIGH',
        reference_type: 'JOB_CARD',
        reference_id: jobCard.id,
        user_role: 'ALL',
      });

      await createSystemNotification({
        title: 'Bundles Generated',
        message: `${bundlesToCreate.length} Bundles generated for Job Card ${jobCard.job_card_number}.`,
        type: 'BUNDLE',
        priority: 'MEDIUM',
        reference_type: 'JOB_CARD',
        reference_id: jobCard.id,
        user_role: 'ALL',
      });
    }

    const createdBundles = await prisma.bundle.findMany({
      where: { job_card_id },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Color + Size Bundles generated successfully for Job Card ${jobCard.job_card_number}.`,
      data: { bundles: createdBundles },
    });
  } catch (error) {
    return next(error);
  }
};
