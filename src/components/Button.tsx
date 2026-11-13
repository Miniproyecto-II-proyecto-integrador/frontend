import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  const variantStyles = variant === 'primary'
    ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
    : 'border border-[#1e293b] bg-[#111827] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white';

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles} ${className}`}
      {...props}
    />
  );
}
