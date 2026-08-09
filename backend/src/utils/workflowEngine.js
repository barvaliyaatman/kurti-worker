/**
 * Centralized Production Workflow Engine (Backend)
 *
 * Resolves production stage flow, initial statuses, status transitions,
 * action labels, and stage permissions based on Company Workflow Settings.
 */

export const getInitialJobCardStatus = (workflowSettings = {}) => {
  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);

  if (skipCutting && skipBundle) {
    return 'READY_FOR_ASSIGNMENT';
  }
  if (skipCutting) {
    return 'READY_FOR_BUNDLE';
  }
  return 'CREATED';
};

export const getNextStageAfterCutting = (workflowSettings = {}) => {
  const skipBundle = Boolean(workflowSettings?.skip_bundle);
  if (skipBundle) {
    return 'READY_FOR_ASSIGNMENT';
  }
  return 'CUTTING_COMPLETED';
};

export const validateStatusTransition = (workflowSettings = {}, currentStatus, targetStatus) => {
  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);

  if (skipCutting && (targetStatus === 'READY_FOR_CUTTING' || targetStatus === 'CUTTING_IN_PROGRESS')) {
    return {
      allowed: false,
      message: 'Cutting stage is skipped for your company workflow configuration.',
    };
  }

  if (skipBundle && targetStatus === 'READY_FOR_BUNDLE') {
    return {
      allowed: false,
      message: 'Bundle stage is skipped for your company workflow configuration.',
    };
  }

  return { allowed: true };
};
