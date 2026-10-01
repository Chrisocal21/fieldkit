interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

const defaultIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v12m6-6H6" />
  </svg>
)

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-16 px-4 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500">
        {icon ?? defaultIcon}
      </div>
      <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
