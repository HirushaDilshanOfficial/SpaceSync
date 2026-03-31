import React from 'react';

export const Label = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 mb-1.5 block ${className}`}
    {...props}
  >
    {children}
  </label>
));
Label.displayName = 'Label';
