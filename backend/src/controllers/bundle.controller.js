import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCompanyFilter } from '../middleware/tenancy.middleware.js';

export const getBundles = async (req, res, next) => {
  try {
    const { search, status, sort = 'latest', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...getCompanyFilter(req.user),
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { bundle_number: { contains: term, mode: 'insensitive' } },
        { color: { contains: term, mode: 'insensitive' } },
        { job_card: { job_card_number: { contains: term, mode: 'insensitive' } } },
        { job_card: { design_code: { contains: term, mode: 'insensitive' } } },
      ];
    }

    let orderBy = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          job_card: true,
        },
      }),
      prisma.bundle.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Bundles retrieved successfully.',
      data: {
        bundles,
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

export const sendToBundle = async (req, res, next) => {
  try {
    const { job_card_id } = req.body;

    if (!job_card_id) {
      return ApiResponse.error({ res, statusCode: 400, message: 'Job Card ID is required.' });
    }

    const existingJobCard = await prisma.jobCard.findUnique({
      where: { id: job_card_id },
      include: { bundles: true },
    });

    if (!existingJobCard || !assertCompanyOwnership(existingJobCard, req.user)) {
      return ApiResponse.error({ res, statusCode: 404, message: 'Job Card not found.' });
    }

    // Duplicate Creation Protection
    if (existingJobCard.bundles && existingJobCard.bundles.length > 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Bundle creation has already been completed for this Job Card.',
      });
    }

    const { ensureBundlesGeneratedForJobCard } = await import('../utils/bundleHelper.js');
    const updatedJobCard = await ensureBundlesGeneratedForJobCard(job_card_id);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Bundle Created Successfully',
      data: { jobCard: updatedJobCard },
    });
  } catch (error) {
    return next(error);
  }
};
