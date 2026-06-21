export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <div className={`${className} animate-spin rounded-full border-2 border-primary border-t-transparent`} />
  );
}
