import React from 'react';
import { cn } from '../../utils/cn.js';

export const CardList = ({ children, className }) => {
  return <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>{children}</div>;
};

export default CardList;
