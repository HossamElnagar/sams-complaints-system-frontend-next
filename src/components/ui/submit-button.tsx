import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ isLoading, children, className = '', ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || props.disabled}
      className={`px-6 py-3 font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-sm ${className}`}
      {...props}
    >
      {isLoading ? 'جاري التحميل...' : children}
    </button>
  );
}
