import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingService } from '../services/settingService.js';
import { garmentSizeService } from '../services/garmentSizeService.js';

const ConfigContext = createContext({
  config: {},
  categories: {},
  garmentSizes: [],
  isLoading: false,
  refetchConfig: () => {},
});

export const ConfigProvider = ({ children }) => {
  const {
    data = { settings: {}, categories: {} },
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: settingService.getSettings,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: sizesData = [],
    isLoading: isLoadingSizes,
    refetch: refetchSizes,
  } = useQuery({
    queryKey: ['activeGarmentSizes'],
    queryFn: () => garmentSizeService.getGarmentSizes(true),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: workflowSettings = { skip_cutting: false, skip_bundle: false, direct_worker_assignment: false },
    isLoading: isLoadingWorkflow,
    refetch: refetchWorkflow,
  } = useQuery({
    queryKey: ['productionWorkflowSettings'],
    queryFn: () => settingService.getWorkflowSettings(),
    staleTime: 5 * 60 * 1000,
  });

  // Extract size_name array sorted by display_order
  const garmentSizeNames = sizesData.map((s) => s.size_name);
  const fallbackSizes = garmentSizeNames.length > 0 ? garmentSizeNames : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const refetchConfig = () => {
    refetchSettings();
    refetchSizes();
    refetchWorkflow();
  };

  const value = {
    config: data.settings || {},
    categories: data.categories || {},
    garmentSizes: fallbackSizes,
    garmentSizeObjects: sizesData,
    workflowSettings,
    isLoading: isLoadingSettings || isLoadingSizes || isLoadingWorkflow,
    refetchConfig,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);

export default ConfigContext;
