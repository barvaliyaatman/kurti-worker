import { prisma } from '../prisma/prisma.js';
import { getSetting } from '../utils/configHelper.js';

/**
 * Enterprise Number Series Auto-Generator
 */
export const numberSeriesService = {
  /**
   * Generates next Job Card Number (e.g., JC-1, JC-2)
   */
  generateJobCardNumber: async () => {
    const prefix = await getSetting('job_card_prefix', 'JC');
    const count = await prisma.jobCard.count();
    const nextSeq = count + 1;
    return `${prefix}-${nextSeq}`;
  },

  /**
   * Generates next Employee Code (e.g., EMP-1, EMP-2)
   */
  generateEmployeeCode: async () => {
    const prefix = await getSetting('employee_prefix', 'EMP');
    const count = await prisma.employee.count();
    const nextSeq = count + 1;
    return `${prefix}-${nextSeq}`;
  },

  /**
   * Generates next Employee Advance Reference (e.g., ADV-1)
   */
  generateAdvanceRefNumber: async () => {
    const prefix = await getSetting('advance_prefix', 'ADV');
    const count = await prisma.employeeAdvance.count();
    const nextSeq = count + 1;
    return `${prefix}-${nextSeq}`;
  },

  /**
   * Generates next Salary Payment Reference (e.g., PAY-1)
   */
  generatePaymentRefNumber: async () => {
    const prefix = await getSetting('payment_prefix', 'PAY');
    const count = await prisma.employeePayment.count();
    const nextSeq = count + 1;
    return `${prefix}-${nextSeq}`;
  },

  /**
   * Generates Bundle Number (e.g., BND-2001-RD-M)
   */
  generateBundleNumber: async (designCode, color, size) => {
    const prefix = await getSetting('bundle_prefix', 'BND');
    const colorCode = color.substring(0, 2).toUpperCase();
    const sizeCode = size.toUpperCase();
    return `${prefix}-${designCode}-${colorCode}-${sizeCode}`;
  },
};

export default numberSeriesService;
