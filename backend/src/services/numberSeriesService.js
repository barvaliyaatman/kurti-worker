import { prisma } from '../prisma/prisma.js';
import { getSetting } from '../utils/configHelper.js';

/**
 * Enterprise Collision-Free Number Series Auto-Generator
 */
export const numberSeriesService = {
  /**
   * Generates next unique Job Card Number (e.g., JC-1, JC-2, JC-5)
   */
  generateJobCardNumber: async () => {
    const prefix = await getSetting('job_card_prefix', 'JC');
    const existingCards = await prisma.jobCard.findMany({
      select: { job_card_number: true },
    });

    let maxSeq = 0;
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

    for (const card of existingCards) {
      if (!card.job_card_number) continue;
      const match = card.job_card_number.match(prefixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }

    let nextSeq = Math.max(maxSeq, existingCards.length) + 1;
    let candidate = `${prefix}-${nextSeq}`;

    while (existingCards.some((c) => c.job_card_number?.toUpperCase() === candidate.toUpperCase())) {
      nextSeq++;
      candidate = `${prefix}-${nextSeq}`;
    }

    return candidate;
  },

  /**
   * Generates next unique Employee Code (e.g., EMP-1, EMP-2)
   */
  generateEmployeeCode: async () => {
    const prefix = await getSetting('employee_prefix', 'EMP');
    const existing = await prisma.employee.findMany({
      select: { employee_code: true },
    });

    let maxSeq = 0;
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

    for (const item of existing) {
      if (!item.employee_code) continue;
      const match = item.employee_code.match(prefixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }

    let nextSeq = Math.max(maxSeq, existing.length) + 1;
    let candidate = `${prefix}-${nextSeq}`;

    while (existing.some((e) => e.employee_code?.toUpperCase() === candidate.toUpperCase())) {
      nextSeq++;
      candidate = `${prefix}-${nextSeq}`;
    }

    return candidate;
  },

  /**
   * Generates next unique Employee Advance Reference (e.g., ADV-1)
   */
  generateAdvanceRefNumber: async () => {
    const prefix = await getSetting('advance_prefix', 'ADV');
    const existing = await prisma.employeeAdvance.findMany({
      select: { advance_number: true },
    });

    let maxSeq = 0;
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

    for (const item of existing) {
      if (!item.advance_number) continue;
      const match = item.advance_number.match(prefixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }

    let nextSeq = Math.max(maxSeq, existing.length) + 1;
    let candidate = `${prefix}-${nextSeq}`;

    while (existing.some((e) => e.advance_number?.toUpperCase() === candidate.toUpperCase())) {
      nextSeq++;
      candidate = `${prefix}-${nextSeq}`;
    }

    return candidate;
  },

  /**
   * Generates next unique Salary Payment Reference (e.g., PAY-1)
   */
  generatePaymentRefNumber: async () => {
    const prefix = await getSetting('payment_prefix', 'PAY');
    const existing = await prisma.employeePayment.findMany({
      select: { payment_number: true },
    });

    let maxSeq = 0;
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`, 'i');

    for (const item of existing) {
      if (!item.payment_number) continue;
      const match = item.payment_number.match(prefixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }

    let nextSeq = Math.max(maxSeq, existing.length) + 1;
    let candidate = `${prefix}-${nextSeq}`;

    while (existing.some((e) => e.payment_number?.toUpperCase() === candidate.toUpperCase())) {
      nextSeq++;
      candidate = `${prefix}-${nextSeq}`;
    }

    return candidate;
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
