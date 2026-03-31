import React from 'react';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
