import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCompanyFilter, assertCompanyOwnership } from '../middleware/tenancy.middleware.js';
import { getJobCardProductionState } from '../utils/workflowEngine.js';

export const getJobCardsForAssignment = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const companyFilter = getCompanyFilter(req.user);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Fetch Job Cards that have activated bundles OR skip bundle stage directly
    const jobCards = await prisma.jobCard.findMany({
      where: {
        is_deleted: false,
        ...companyFilter,
        OR: [
          { bundles: { some: {} } },
          { AND: [{ skip_bundle: true }, { status: 'READY_FOR_ASSIGNMENT' }] },
        ],
      },
      orderBy: { created_at: 'desc' },
      include: {
        bundles: {
          include: {
            assignments: {
              include: { employee: true },
            },
          },
        },
      },
    });

    // Compute synchronized assignment metrics for each Job Card
    const formattedJobCards = jobCards.map((jc) => {
      const state = getJobCardProductionState(jc);
      const totalBundles = state.totalBundles;
      const assignedBundles = state.assignedBundles;
      const completedBundles = state.completedBundles;
      const pendingBundles = state.pendingBundles;

      const progressPercentage = totalBundles > 0
        ? Math.round((completedBundles / totalBundles) * 100)
        : 0;

      let assignmentStatus = state.currentStage;
      if (completedBundles === totalBundles && totalBundles > 0) {
        assignmentStatus = 'COMPLETED';
      } else if (assignedBundles > 0) {
        assignmentStatus = 'IN_ASSIGNMENT';
      }

      return {
        id: jc.id,
        job_card_number: jc.job_card_number,
        design_code: jc.design_code,
        stitching_rate: jc.stitching_rate,
        total_quantity: jc.total_quantity,
        priority: jc.priority,
        due_date: jc.due_date,
        status: state.currentStage,
        stage_label: state.stageLabel,
        assignment_status: assignmentStatus,
        total_bundles: totalBundles,
        assigned_bundles: assignedBundles,
        completed_bundles: completedBundles,
        pending_bundles: pendingBundles,
        progress_percentage: progressPercentage,
        created_at: jc.created_at,
        skip_cutting: jc.skip_cutting,
        skip_bundle: jc.skip_bundle,
      };
    });

    // Apply Client Filter
    let filtered = formattedJobCards;

    if (status && status !== 'ALL') {
      filtered = filtered.filter((jc) => jc.assignment_status === status.toUpperCase());
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (jc) =>
          jc.job_card_number.toLowerCase().includes(term) ||
          jc.design_code.toLowerCase().includes(term)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job Cards for assignment queue retrieved successfully.',
      data: {
        jobCards: paginated,
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

export const getJobCardBundlesWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobCard = await prisma.jobCard.findUnique({
      where: { id },
      include: {
        bundles: {
          include: {
            assignments: {
              include: { employee: true },
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { bundle_number: 'asc' },
        },
      },
    });

    if (!jobCard || !assertCompanyOwnership(jobCard, req.user)) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Job Card not found.',
      });
    }

    // Auto-generate bundles if not already generated and eligible
    if (jobCard.bundles.length === 0) {
      const { ensureBundlesGeneratedForJobCard } = await import('../utils/bundleHelper.js');
      const updatedCard = await ensureBundlesGeneratedForJobCard(id);
      if (updatedCard) {
        return getJobCardBundlesWorkspace(req, res, next);
      }
    }

    // Fetch all assignments for this Job Card's bundles
    const bundleIds = jobCard.bundles.map((b) => b.id);
    const assignments = await prisma.assignment.findMany({
      where: {
        bundle_id: { in: bundleIds },
      },
      include: {
        bundle: true,
        employee: true,
        history: {
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Format metrics
    const totalBundles = jobCard.bundles.length;
    const assignedBundles = jobCard.bundles.filter((b) => b.assigned_sets > 0).length;
    const completedBundles = jobCard.bundles.filter((b) => b.status === 'COMPLETED' || b.completed_sets >= b.total_sets).length;
    const pendingBundles = jobCard.bundles.filter((b) => b.assigned_sets < b.total_sets).length;

    const progressPercentage = totalBundles > 0
      ? Math.round((completedBundles / totalBundles) * 100)
      : 0;

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Job Card assignment workspace retrieved successfully.',
      data: {
        jobCard: {
          id: jobCard.id,
          job_card_number: jobCard.job_card_number,
          design_code: jobCard.design_code,
          stitching_rate: jobCard.stitching_rate,
          total_quantity: jobCard.total_quantity,
          priority: jobCard.priority,
          due_date: jobCard.due_date,
          status: jobCard.status,
          remarks: jobCard.remarks,
        },
        summary: {
          total_bundles: totalBundles,
          assigned_bundles: assignedBundles,
          completed_bundles: completedBundles,
          pending_bundles: pendingBundles,
          progress_percentage: progressPercentage,
        },
        bundles: jobCard.bundles,
        assignments,
      },
    });
  } catch (error) {
    return next(error);
  }
};
