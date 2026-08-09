import { prisma } from '../prisma/prisma.js';

const COLOR_SHORT_CODES = {
  Red: 'RD',
  Blue: 'BL',
  Green: 'GR',
  Black: 'BK',
  White: 'WH',
  Yellow: 'YL',
  Pink: 'PK',
  Navy: 'NV',
  Maroon: 'MR',
  Grey: 'GY',
};

/**
 * Ensures production Bundle records are generated from a Job Card's actual
 * Color + Size item breakdown, taking into account saved workflow snapshot
 * and component cutting progress (partial cutting protection).
 */
export const ensureBundlesGeneratedForJobCard = async (jobCardId) => {
  const jobCard = await prisma.jobCard.findUnique({
    where: { id: jobCardId },
    include: {
      items: true,
      cutting_progress: true,
      bundles: true,
    },
  });

  if (!jobCard) return null;

  // If bundles are already generated, return existing jobCard
  if (jobCard.bundles && jobCard.bundles.length > 0) {
    return jobCard;
  }

  // Calculate component cutting availability (if cutting was performed)
  const componentsList = typeof jobCard.components === 'string'
    ? jobCard.components.split(',')
    : ['Top', 'Pant'];

  const skipCutting = Boolean(jobCard.skip_cutting);

  let cutAvailabilityRatio = 1.0; // Default 100% available if skipCutting is true

  if (!skipCutting && jobCard.cutting_progress.length > 0) {
    const completedCount = jobCard.cutting_progress.filter((cp) => cp.status === 'COMPLETED').length;
    cutAvailabilityRatio = completedCount / Math.max(1, componentsList.length);
  }

  // Generate Bundles from JobCard items (Color + Size breakdown)
  const bundlesToCreate = jobCard.items.map((item) => {
    const colorClean = item.color.trim();
    const colorCode = COLOR_SHORT_CODES[colorClean] || colorClean.substring(0, 2).toUpperCase();
    const bundleNum = `${jobCard.job_card_number}-${colorCode}-${item.size.toUpperCase()}`;

    // Available sets respecting partial cutting
    const availableSets = Math.floor(item.quantity * cutAvailabilityRatio);

    return {
      bundle_number: bundleNum,
      job_card_id: jobCard.id,
      color: colorClean,
      size: item.size.trim().toUpperCase(),
      total_sets: Math.max(1, availableSets > 0 ? availableSets : item.quantity),
      assigned_sets: 0,
      completed_sets: 0,
      status: 'READY_FOR_ASSIGNMENT',
      company_id: jobCard.company_id || null,
    };
  });

  if (bundlesToCreate.length > 0) {
    await prisma.bundle.createMany({
      data: bundlesToCreate,
      skipDuplicates: true,
    });
  }

  // Update Job Card status
  const nextStatus = jobCard.skip_bundle ? 'READY_FOR_ASSIGNMENT' : 'READY_FOR_BUNDLE';
  const updatedJobCard = await prisma.jobCard.update({
    where: { id: jobCardId },
    data: { status: nextStatus },
    include: {
      items: true,
      bundles: {
        include: {
          assignments: {
            include: { employee: true },
          },
        },
      },
    },
  });

  return updatedJobCard;
};
