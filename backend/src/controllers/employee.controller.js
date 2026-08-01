import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { search, status, sort = 'latest', page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      is_deleted: false,
    };

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { employee_code: { contains: term, mode: 'insensitive' } },
        { employee_name: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    let orderBy = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      orderBy = { employee_name: 'asc' };
    } else if (sort === 'code') {
      orderBy = { employee_code: 'asc' };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { assignments: true },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employees retrieved successfully.',
      data: {
        employees,
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

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { bundle: true },
        },
      },
    });

    if (!employee || employee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee details retrieved successfully.',
      data: { employee },
    });
  } catch (error) {
    return next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { employee_code, employee_name, phone, joining_date, notes } = req.body;

    const cleanCode = employee_code.trim().toUpperCase();

    // Check unique employee code
    const existingCode = await prisma.employee.findUnique({
      where: { employee_code: cleanCode },
    });
    if (existingCode) {
      return ApiResponse.error({
        res,
        statusCode: 409,
        message: `Employee code '${cleanCode}' already exists.`,
      });
    }

    // Check unique phone number
    const existingPhone = await prisma.employee.findUnique({
      where: { phone: phone.trim() },
    });
    if (existingPhone) {
      return ApiResponse.error({
        res,
        statusCode: 409,
        message: `Phone number '${phone}' is already registered.`,
      });
    }

    const newEmployee = await prisma.employee.create({
      data: {
        employee_code: cleanCode,
        employee_name: employee_name.trim(),
        phone: phone.trim(),
        joining_date: new Date(joining_date),
        status: 'ACTIVE',
        notes: notes ? notes.trim() : null,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: 'Employee created successfully.',
      data: { employee: newEmployee },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_name, phone, joining_date, notes } = req.body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee || existingEmployee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    if (phone && phone.trim() !== existingEmployee.phone) {
      const phoneTaken = await prisma.employee.findUnique({
        where: { phone: phone.trim() },
      });
      if (phoneTaken) {
        return ApiResponse.error({
          res,
          statusCode: 409,
          message: `Phone number '${phone}' is already registered to another worker.`,
        });
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...(employee_name && { employee_name: employee_name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(joining_date && { joining_date: new Date(joining_date) }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Employee details updated successfully.',
      data: { employee: updatedEmployee },
    });
  } catch (error) {
    return next(error);
  }
};

export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee || existingEmployee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Employee '${updatedEmployee.employee_name}' status set to ${updatedEmployee.status}.`,
      data: { employee: updatedEmployee },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee || existingEmployee.is_deleted) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Employee not found.',
      });
    }

    // STRICT BUSINESS RULE: Cannot delete worker with production history
    const assignmentCount = await prisma.assignment.count({
      where: { employee_id: id },
    });

    if (assignmentCount > 0) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Employee '${existingEmployee.employee_name}' has ${assignmentCount} production assignment history records and cannot be deleted. You may only Deactivate this employee.`,
      });
    }

    const archivedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: req.user?.full_name || 'Factory Owner',
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Employee '${archivedEmployee.employee_name}' moved to Trash Archive.`,
      data: { employee: archivedEmployee },
    });
  } catch (error) {
    return next(error);
  }
};
