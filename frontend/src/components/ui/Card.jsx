import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`font-semibold text-lg leading-none tracking-tight text-slate-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-slate-500 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-0 flex-1 flex flex-col ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`flex items-center p-6 pt-0 mt-auto ${className}`} {...props}>
      {children}
    </div>
  );
}
