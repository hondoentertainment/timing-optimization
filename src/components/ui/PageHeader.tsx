interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 animate-fade-in">
      <div>
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-[var(--label)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[var(--label-secondary)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-[var(--label-secondary)]">
      {children}
    </p>
  )
}
