import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCompanyFilter } from '../middleware/tenancy.middleware.js';

const DEFAULT_GARMENT_SIZES = [
  { size_name: 'XS', display_order: 1, is_active: true },
  { size_name: 'S', display_order: 2, is_active: true },
  { size_name: 'M', display_order: 3, is_active: true },
  { size_name: 'L', display_order: 4, is_active: true },
  { size_name: 'XL', display_order: 5, is_active: true },
  { size_name: 'XXL', display_order: 6, is_active: true },
  { size_name: '3XL', display_order: 7, is_active: true },
  { size_name: 'Free Size', display_order: 8, is_active: true },
];

export const getGarmentSizes = async (req, res, next) => {
  try {
    const { active_only } = req.query;
    const companyFilter = getCompanyFilter(req.user);

    const where = { ...companyFilter };
    if (active_only === 'true') {
      where.is_active = true;
    }

    let sizes = await prisma.garmentSize.findMany({
      where,
      orderBy: { display_order: 'asc' },
    });

    // Seed defaults if table is empty for this company
    if (sizes.length === 0) {
      const seedData = DEFAULT_GARMENT_SIZES.map(s => ({
        ...s,
        company_id: req.user.company_id || null,
      }));
      await prisma.garmentSize.createMany({
        data: seedData,
        skipDuplicates: true,
      });
      sizes = await prisma.garmentSize.findMany({
        where,
        orderBy: { display_order: 'asc' },
      });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Garment sizes retrieved successfully.',
      data: { sizes },
    });
  } catch (error) {
    return next(error);
  }
};

export const createGarmentSize = async (req, res, next) => {
  try {
    const { size_name, display_order, is_active } = req.body;

    const cleanName = size_name.trim();

    const existing = await prisma.garmentSize.findUnique({
      where: { size_name: cleanName },
    });

    if (existing) {
      return ApiResponse.error({
        res,
        statusCode: 409,
        message: `Garment size '${cleanName}' already exists.`,
      });
    }

    const orderNum = display_order !== undefined ? parseInt(display_order, 10) : 0;

    const newSize = await prisma.garmentSize.create({
      data: {
        size_name: cleanName,
        display_order: orderNum,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: `Garment size '${cleanName}' created successfully.`,
      data: { size: newSize },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateGarmentSize = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { size_name, display_order, is_active } = req.body;

    const existing = await prisma.garmentSize.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Garment size not found.',
      });
    }

    const updatedSize = await prisma.garmentSize.update({
      where: { id },
      data: {
        ...(size_name && { size_name: size_name.trim() }),
        ...(display_order !== undefined && { display_order: parseInt(display_order, 10) }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Garment size updated successfully.',
      data: { size: updatedSize },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteGarmentSize = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.garmentSize.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Garment size not found.',
      });
    }

    await prisma.garmentSize.delete({
      where: { id },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Garment size '${existing.size_name}' deleted successfully.`,
    });
  } catch (error) {
    return next(error);
  }
};
