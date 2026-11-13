type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className = '' }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none ${className}`}
    />
  );
}
