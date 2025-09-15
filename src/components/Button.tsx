import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "success" | "danger" | "secondary"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  className?: string
  title?: string
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  title,
}: ButtonProps) {
  const baseClasses =
    "flex items-center justify-center gap-2 font-medium rounded-lg shadow-lg transition-colors disabled:cursor-not-allowed"

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white",
    success: "bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white",
    danger: "bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white",
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
