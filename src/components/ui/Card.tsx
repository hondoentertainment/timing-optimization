interface CardProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
}

export function Card({ children, className = '', inset }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] ${
        inset ? 'mx-0' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function CardRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--fill-secondary)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  )
}

export function CardDivider() {
  return <div className="ml-4 h-px bg-[var(--separator)]" />
}
