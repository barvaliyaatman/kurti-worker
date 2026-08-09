import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createSystemNotification } from '../utils/notificationHelper.js';
import { getSetting } from '../utils/configHelper.js';
import { getCompanyFilter, assertCompanyOwnership } from '../middleware/tenancy.middleware.js';
import { getInitialJobCardStatus } from '../utils/workflowEngine.js';

export const getJobCards = async (req, res, next) => {
  try {
    const { search, status, priority, sort = 'latest', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      is_deleted: false,
      ...getCompanyFilter(req.user),
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority.toUpperCase();
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
    } else if (sort === 'due_date') {
      orderBy = { due_date: 'asc' };
    }

    const [jobCards, total] = await Promise.all([
      prisma.jobCard.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          items: true,
        },
      }),
      prisma.jobCard.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job cards retrieved successfully.',
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

export const getJobCardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobCard = await prisma.jobCard.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!jobCard || jobCard.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    if (!assertCompanyOwnership(jobCard, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job card details retrieved successfully.',
      data: { jobCard },
    });
  } catch (error) {
    return next(error);
  }
};

export const createJobCard = async (req, res, next) => {
  try {
    const { job_card_number, design_code, components, stitching_rate, priority, due_date, remarks, items } =
      req.body;

    const cleanNumber = job_card_number.trim().toUpperCase();

    // Check unique Job Card Number
    const existing = await prisma.jobCard.findUnique({
      where: { job_card_number: cleanNumber },
    });
    if (existing) {
      return ApiResponse.error({
        res,
        statusCode: 409,
        message: `Job Card Number '${cleanNumber}' already exists.`,
      });
    }

    // Dynamic Setting Defaults from Config Engine
    const defaultPriority = await getSetting('default_priority', 'NORMAL');
    const defaultStitchingRate = await getSetting('default_stitching_rate', 110.0);
    const defaultDueDays = await getSetting('default_due_days', 7);

    // Process components list into comma-separated string
    const compStr = Array.isArray(components)
      ? components.join(',')
      : typeof components === 'string'
      ? components
      : 'Top,Pant';

    // Auto calculate total quantity from color/size items breakdown
    const totalQuantity = items.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);

    // Calculate Due Date if not supplied
    let calculatedDueDate;
    if (due_date) {
      calculatedDueDate = new Date(due_date);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(defaultDueDays, 10));
      calculatedDueDate = d;
    }

    const finalPriority = priority || defaultPriority;
    const finalStitchingRate = parseFloat(stitching_rate) || parseFloat(defaultStitchingRate);

    // Fetch company workflow settings to resolve initial status dynamically
    const companyId = req.user.company_id || null;
    let workflowSettings = null;
    if (companyId) {
      workflowSettings = await prisma.productionWorkflowSettings.findUnique({
        where: { company_id: companyId },
      });
    }

    const skipCutting = Boolean(workflowSettings?.skip_cutting);
    const skipBundle = Boolean(workflowSettings?.skip_bundle);
    const initialStatus = getInitialJobCardStatus(workflowSettings);

    const newJobCard = await prisma.jobCard.create({
      data: {
        job_card_number: cleanNumber,
        design_code: design_code.trim().toUpperCase(),
        components: compStr,
        stitching_rate: finalStitchingRate,
        total_quantity: totalQuantity,
        priority: finalPriority,
        due_date: calculatedDueDate,
        status: initialStatus,
        skip_cutting: skipCutting,
        skip_bundle: skipBundle,
        remarks: remarks ? remarks.trim() : null,
        created_by: req.user?.full_name || 'Factory Owner',
        company_id: req.user.company_id || null,
        items: {
          create: items.map((item) => ({
            color: item.color.trim(),
            size: item.size.trim().toUpperCase(),
            quantity: parseInt(item.quantity, 10),
          })),
        },
      },
      include: { items: true },
    });

    // If cutting is skipped, generate bundles immediately from Color + Size breakdown
    if (skipCutting) {
      const { ensureBundlesGeneratedForJobCard } = await import('../utils/bundleHelper.js');
      await ensureBundlesGeneratedForJobCard(newJobCard.id);
    }

    // Generate System Notification
    await createSystemNotification({
      title: 'New Job Card Created',
      message: `Job Card ${cleanNumber} has been created.`,
      type: 'JOB_CARD',
      priority: finalPriority === 'URGENT' ? 'CRITICAL' : finalPriority === 'HIGH' ? 'HIGH' : 'MEDIUM',
      reference_type: 'JOB_CARD',
      reference_id: newJobCard.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: 'Job card created successfully.',
      data: { jobCard: newJobCard },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateJobCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { design_code, components, stitching_rate, priority, due_date, remarks, items } = req.body;

    const existingCard = await prisma.jobCard.findUnique({ where: { id } });

    if (!existingCard || existingCard.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    if (!assertCompanyOwnership(existingCard, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    let compStr = existingCard.components;
    if (components) {
      compStr = Array.isArray(components) ? components.join(',') : components;
    }

    let totalQuantity = existingCard.total_quantity;
    if (items && items.length > 0) {
      totalQuantity = items.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);
    }

    // Delete existing items if updating items breakdown
    if (items && items.length > 0) {
      await prisma.jobCardItem.deleteMany({
        where: { job_card_id: id },
      });
    }

    const updatedJobCard = await prisma.jobCard.update({
      where: { id },
      data: {
        ...(design_code && { design_code: design_code.trim().toUpperCase() }),
        components: compStr,
        ...(stitching_rate && { stitching_rate: parseFloat(stitching_rate) }),
        total_quantity: totalQuantity,
        ...(priority && { priority }),
        ...(due_date && { due_date: new Date(due_date) }),
        ...(remarks !== undefined && { remarks: remarks ? remarks.trim() : null }),
        ...(items && items.length > 0 && {
          items: {
            create: items.map((item) => ({
              color: item.color.trim(),
              size: item.size.trim().toUpperCase(),
              quantity: parseInt(item.quantity, 10),
            })),
          },
        }),
      },
      include: {
        items: true,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job card updated successfully.',
      data: { jobCard: updatedJobCard },
    });
  } catch (error) {
    return next(error);
  }
};

export const sendToCutting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingCard = await prisma.jobCard.findUnique({ where: { id } });

    if (!existingCard || existingCard.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    if (!assertCompanyOwnership(existingCard, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    if (existingCard.status !== 'CREATED') {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Job card is already in '${existingCard.status}' state and cannot be sent to cutting again.`,
      });
    }

    const updatedCard = await prisma.jobCard.update({
      where: { id },
      data: {
        status: 'READY_FOR_CUTTING',
      },
      include: {
        items: true,
      },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Job Card Sent To Cutting',
      message: `Job Card ${updatedCard.job_card_number} is ready for cutting.`,
      type: 'CUTTING',
      priority: 'HIGH',
      reference_type: 'JOB_CARD',
      reference_id: updatedCard.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Job Card ${updatedCard.job_card_number} is now Ready for Cutting.`,
      data: { jobCard: updatedCard },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteJobCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingCard = await prisma.jobCard.findUnique({ where: { id } });

    if (!existingCard || existingCard.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    if (!assertCompanyOwnership(existingCard, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job card not found.' });
    }

    // STRICT BUSINESS RULE: Cannot delete if in active production
    if (existingCard.status !== 'CREATED') {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Job Card '${existingCard.job_card_number}' has entered active production (${existingCard.status}) and cannot be archived or deleted.`,
      });
    }

    const archivedCard = await prisma.jobCard.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: req.user?.full_name || 'Factory Owner',
      },
    });

    // Generate System Notification
    await createSystemNotification({
      title: 'Job Card Archived',
      message: `Job Card ${archivedCard.job_card_number} was moved to Trash Archive by ${req.user?.full_name}.`,
      type: 'JOB_CARD',
      priority: 'MEDIUM',
      reference_type: 'JOB_CARD',
      reference_id: archivedCard.id,
      user_role: 'ALL',
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Job Card '${archivedCard.job_card_number}' moved to Trash Archive successfully.`,
      data: { jobCard: archivedCard },
    });
  } catch (error) {
    return next(error);
  }
};
