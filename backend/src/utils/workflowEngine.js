/**
 * Centralized Production Workflow Engine (Backend)
 *
 * Resolves initial production stage, status transitions, action labels,
 * stage permissions, and overall production state synchronization based on
 * Company Workflow Settings & Job Card snapshots.
 */

export const getInitialJobCardStage = (workflowSettings = {}) => {
  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);

  if (skipCutting && skipBundle) {
    return 'READY_FOR_ASSIGNMENT';
  }
  if (skipCutting) {
    return 'READY_FOR_BUNDLE';
  }
  return 'READY_FOR_CUTTING';
};

export const getInitialJobCardStatus = getInitialJobCardStage;

export const getNextStageAfterCutting = (workflowSettings = {}, jobCard = {}) => {
  const skipBundle = Boolean(jobCard?.skip_bundle ?? workflowSettings?.skip_bundle);
  if (skipBundle) {
    return 'READY_FOR_ASSIGNMENT';
  }
  return 'CUTTING_COMPLETED';
};

export const validateStatusTransition = (workflowSettings = {}, jobCard = {}, targetStatus) => {
  const skipCutting = Boolean(jobCard?.skip_cutting ?? workflowSettings?.skip_cutting);
  const skipBundle = Boolean(jobCard?.skip_bundle ?? workflowSettings?.skip_bundle);

  if (skipCutting && (targetStatus === 'READY_FOR_CUTTING' || targetStatus === 'CUTTING_IN_PROGRESS')) {
    return {
      allowed: false,
      message: 'Cutting stage is skipped for this Job Card.',
    };
  }

  if (skipBundle && targetStatus === 'READY_FOR_BUNDLE') {
    return {
      allowed: false,
      message: 'Bundle stage is skipped for this Job Card.',
    };
  }

  return { allowed: true };
};

/**
 * Single Source of Truth: Centralized Job Card Production State Resolver
 */
export const getJobCardProductionState = (jobCard = {}, workflowSettings = {}) => {
  if (!jobCard || !jobCard.id) {
    return {
      currentStage: 'UNKNOWN',
      stageLabel: 'Unknown',
      bundleStatus: 'PENDING',
      assignmentStatus: 'PENDING',
      totalBundles: 0,
      assignedBundles: 0,
      completedBundles: 0,
      pendingBundles: 0,
      primaryAction: { label: 'View Details', actionKey: 'VIEW', allowed: false },
    };
  }

  const skipCutting = Boolean(jobCard?.skip_cutting ?? workflowSettings?.skip_cutting);
  const skipBundle = Boolean(jobCard?.skip_bundle ?? workflowSettings?.skip_bundle);

  const rawStatus = jobCard.status;
  const bundles = jobCard.bundles || [];

  const totalBundles = bundles.length;
  const assignedBundles = bundles.filter((b) => b.assigned_sets > 0).length;
  const completedBundles = bundles.filter((b) => b.status === 'COMPLETED' || b.completed_sets >= b.total_sets).length;
  const pendingBundles = bundles.filter((b) => b.assigned_sets < b.total_sets).length;

  // Determine actual production stage
  let currentStage = rawStatus;

  if (rawStatus === 'CREATED') {
    currentStage = getInitialJobCardStage(workflowSettings);
  }

  if (rawStatus === 'CUTTING_COMPLETED') {
    currentStage = skipBundle ? 'READY_FOR_ASSIGNMENT' : 'READY_FOR_BUNDLE';
  }

  // Stage Label
  const stageLabels = {
    READY_FOR_CUTTING: 'Ready For Cutting',
    CUTTING_IN_PROGRESS: 'Cutting In Progress',
    CUTTING_COMPLETED: 'Cutting Completed',
    READY_FOR_BUNDLE: 'Ready For Bundle',
    READY_FOR_ASSIGNMENT: 'Ready For Assignment',
    IN_ASSIGNMENT: 'In Assignment',
    COMPLETED: 'Completed',
  };

  const stageLabel = stageLabels[currentStage] || currentStage;

  // Primary Action Resolver
  const primaryAction = getJobCardPrimaryAction(workflowSettings, { ...jobCard, status: currentStage, bundles });

  return {
    currentStage,
    stageLabel,
    skipCutting,
    skipBundle,
    totalBundles,
    assignedBundles,
    completedBundles,
    pendingBundles,
    primaryAction,
  };
};

export const getJobCardPrimaryAction = (workflowSettings = {}, jobCard = {}) => {
  if (!jobCard) return { label: 'View Details', actionKey: 'VIEW', allowed: false };

  const skipCutting = Boolean(jobCard?.skip_cutting ?? workflowSettings?.skip_cutting);
  const skipBundle = Boolean(jobCard?.skip_bundle ?? workflowSettings?.skip_bundle);
  const status = jobCard.status;
  const totalBundles = jobCard.bundles?.length || 0;

  // If bundles are already generated/activated or card is in assignment stage
  if (totalBundles > 0 || status === 'READY_FOR_ASSIGNMENT' || status === 'IN_ASSIGNMENT') {
    return {
      label: 'Open Assignment Workspace',
      actionKey: 'ASSIGN_WORK',
      targetPath: `/job-cards/${jobCard.id}`,
      allowed: true,
    };
  }

  if (status === 'CREATED' || status === 'READY_FOR_CUTTING') {
    if (skipCutting && skipBundle) {
      return {
        label: 'Open Assignment Workspace',
        actionKey: 'ASSIGN_WORK',
        targetPath: `/job-cards/${jobCard.id}`,
        allowed: true,
      };
    }
    if (skipCutting) {
      return {
        label: 'Create Bundle',
        actionKey: 'SEND_TO_BUNDLE',
        targetPath: `/job-cards/${jobCard.id}`,
        allowed: true,
      };
    }
    return {
      label: 'Send to Cutting',
      actionKey: 'SEND_TO_CUTTING',
      nextStatus: 'READY_FOR_CUTTING',
      allowed: true,
    };
  }

  if (status === 'READY_FOR_BUNDLE' || status === 'CUTTING_COMPLETED') {
    if (skipBundle) {
      return {
        label: 'Open Assignment Workspace',
        actionKey: 'ASSIGN_WORK',
        targetPath: `/job-cards/${jobCard.id}`,
        allowed: true,
      };
    }
    return {
      label: 'Create Bundle',
      actionKey: 'SEND_TO_BUNDLE',
      targetPath: `/job-cards/${jobCard.id}`,
      allowed: true,
    };
  }

  if (status === 'CUTTING_IN_PROGRESS') {
    return {
      label: 'Cutting Queue',
      actionKey: 'VIEW_CUTTING',
      targetPath: `/cutting/${jobCard.id}`,
      allowed: true,
    };
  }

  return {
    label: 'View Details',
    actionKey: 'VIEW_DETAILS',
    targetPath: `/job-cards/${jobCard.id}`,
    allowed: true,
  };
};
