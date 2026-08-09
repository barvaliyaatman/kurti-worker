/**
 * Centralized Production Workflow Engine (Frontend)
 *
 * Resolves production stage flow, status transitions, action labels,
 * button rendering, and timeline steps based on Company Workflow Settings.
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

export const getJobCardPrimaryAction = (workflowSettings = {}, jobCard = {}) => {
  if (!jobCard) return { label: 'View Details', actionKey: 'VIEW', allowed: false };

  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);
  const status = jobCard.status;

  if (status === 'CREATED') {
    if (skipCutting && skipBundle) {
      return {
        label: 'Assign Work',
        actionKey: 'ASSIGN_WORK',
        targetPath: `/job-cards/${jobCard.id}`,
        allowed: true,
        variant: 'primary',
      };
    }
    if (skipCutting) {
      return {
        label: 'Send to Bundle',
        actionKey: 'SEND_TO_BUNDLE',
        targetPath: '/assignments',
        allowed: true,
        variant: 'primary',
      };
    }
    return {
      label: 'Send to Cutting',
      actionKey: 'SEND_TO_CUTTING',
      nextStatus: 'READY_FOR_CUTTING',
      allowed: true,
      variant: 'primary',
    };
  }

  if (status === 'READY_FOR_CUTTING' || status === 'CUTTING_IN_PROGRESS') {
    if (skipCutting) {
      if (skipBundle) {
        return {
          label: 'Assign Work',
          actionKey: 'ASSIGN_WORK',
          targetPath: `/job-cards/${jobCard.id}`,
          allowed: true,
          variant: 'primary',
        };
      }
      return {
        label: 'Send to Bundle',
        actionKey: 'SEND_TO_BUNDLE',
        targetPath: '/assignments',
        allowed: true,
        variant: 'primary',
      };
    }
    return {
      label: 'View Cutting Queue',
      actionKey: 'VIEW_CUTTING',
      targetPath: `/cutting/${jobCard.id}`,
      allowed: true,
      variant: 'outline',
    };
  }

  if (status === 'CUTTING_COMPLETED' || status === 'READY_FOR_BUNDLE') {
    if (skipBundle) {
      return {
        label: 'Assign Work',
        actionKey: 'ASSIGN_WORK',
        targetPath: `/job-cards/${jobCard.id}`,
        allowed: true,
        variant: 'primary',
      };
    }
    return {
      label: 'Send to Bundle',
      actionKey: 'SEND_TO_BUNDLE',
      targetPath: `/job-cards/${jobCard.id}`,
      allowed: true,
      variant: 'primary',
    };
  }

  if (status === 'READY_FOR_ASSIGNMENT') {
    return {
      label: 'Assign Work',
      actionKey: 'ASSIGN_WORK',
      targetPath: `/job-cards/${jobCard.id}`,
      allowed: true,
      variant: 'primary',
    };
  }

  return {
    label: 'View Details',
    actionKey: 'VIEW_DETAILS',
    targetPath: `/job-cards/${jobCard.id}`,
    allowed: true,
    variant: 'ghost',
  };
};

export const getJobCardTimeline = (workflowSettings = {}, jobCard = {}) => {
  const skipCutting = Boolean(workflowSettings?.skip_cutting);
  const skipBundle = Boolean(workflowSettings?.skip_bundle);
  const status = jobCard?.status || 'CREATED';

  const isCuttingDone =
    status === 'CUTTING_COMPLETED' ||
    status === 'READY_FOR_BUNDLE' ||
    status === 'READY_FOR_ASSIGNMENT';

  const isBundleDone = status === 'READY_FOR_ASSIGNMENT';

  const steps = [
    { id: 'created', label: 'Job Card Created', done: true, current: status === 'CREATED' },
  ];

  if (!skipCutting) {
    steps.push({
      id: 'cutting',
      label: 'Cutting Stage',
      done: isCuttingDone,
      current: status === 'READY_FOR_CUTTING' || status === 'CUTTING_IN_PROGRESS',
    });
  }

  if (!skipBundle) {
    steps.push({
      id: 'bundle',
      label: 'Bundle Stage',
      done: isBundleDone,
      current: status === 'CUTTING_COMPLETED' || status === 'READY_FOR_BUNDLE',
    });
  }

  steps.push({
    id: 'assignment',
    label: skipBundle || (skipCutting && skipBundle) ? 'Direct Worker Assignment' : 'Worker Assignment',
    done: status === 'COMPLETED',
    current: status === 'READY_FOR_ASSIGNMENT',
  });

  return steps;
};
