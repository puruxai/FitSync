import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[]; // For select dropdowns
}

export const Input = React.forwardRef<any, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  type = 'text',
  as = 'input',
  options = [],
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputStyles = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200';
  
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
  const paddingLeft = leftIcon ? 'pl-11' : '';
  const paddingRight = rightIcon ? 'pr-11' : '';
  
  const inputClass = `${baseInputStyles} ${errorStyles} ${paddingLeft} ${paddingRight} ${className}`;

  return (
    <div className="w-full text-left mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none text-[1.25em]">
            {leftIcon}
          </span>
        )}
        
        {as === 'textarea' ? (
          <textarea
            id={inputId}
            ref={ref}
            className={`${inputClass} resize-none min-h-[100px]`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : as === 'select' ? (
          <select
            id={inputId}
            ref={ref}
            className={`${inputClass} appearance-none`}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={inputClass}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        {as === 'select' && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none">
            keyboard_arrow_down
          </span>
        )}
        
        {rightIcon && as !== 'select' && (
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none text-[1.25em]">
            {rightIcon}
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 flex items-center">
          <span className="material-symbols-outlined text-[1.2em] mr-1 align-middle leading-none">error</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
