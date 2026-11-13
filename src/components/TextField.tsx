import { useId, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';

type TextFieldProps = ComponentPropsWithRef<'input'> & {
  label: string;
  helpText?: string;
  error?: string;
};

export default function TextField({
  label,
  helpText,
  error,
  id,
  className = '',
  type = 'text',
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? generatedId;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptions = [describedBy, helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-[#cbd5e1]">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={type === 'password' && showPassword ? 'text' : type}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptions}
          className={`w-full rounded-md border bg-[#03111f] px-3.5 py-3 text-sm text-[#f8fafc] placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-red-400 pr-10' : 'border-[#344458]'} ${type === 'password' ? 'pr-14' : ''} ${className}`}
        />
        {type === 'password' && <button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} disabled={props.disabled} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-200 underline focus-visible:outline-2 focus-visible:outline-offset-2">{showPassword ? 'Ocultar' : 'Mostrar'}</button>}
        {error && type !== 'password' && (
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-bold text-red-400">
            !
          </span>
        )}
      </div>
      {helpText && <p id={helpId} className="text-xs text-[#94a3b8]">{helpText}</p>}
      {error && <p id={errorId} role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
