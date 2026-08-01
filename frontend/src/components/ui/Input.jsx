import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      icon: Icon,
      helperText,
      onClear,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-bold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full h-10 rounded-xl border bg-white font-semibold text-slate-900 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#384CF0]/20 focus:border-[#384CF0] disabled:bg-slate-100 disabled:cursor-not-allowed shadow-2xs',
              Icon ? 'pl-9' : 'pl-3.5',
              isPassword || onClear ? 'pr-9' : 'pr-3.5',
              error
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 bg-red-50/20'
                : 'border-slate-200/90',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-700 focus:outline-none p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {onClear && !isPassword && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 text-slate-400 hover:text-slate-700 focus:outline-none p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-bold text-red-600 mt-0.5">{error}</p>
        ) : (
          helperText && <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
