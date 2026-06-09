type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:brightness-110 active:brightness-95 shadow-sm',
  secondary:
    'bg-[var(--fill-secondary)] text-[var(--label)] hover:bg-[var(--fill)] active:scale-[0.98]',
  ghost:
    'text-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.98]',
  destructive:
    'text-[var(--danger)] hover:bg-[rgba(255,59,48,0.1)] active:scale-[0.98]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-[13px] rounded-lg' : 'px-4 py-2 text-sm rounded-[var(--radius-md)]'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
