import React from "react"

interface AvatarProps {
  username?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
}

export const Avatar: React.FC<AvatarProps> = ({
  username,
  size = "sm",
  className = "",
}) => {
  const avatarUrl = username
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`
    : null

  const sizeClass = sizeClasses[size]
  const baseClasses = `${sizeClass} rounded-full`
  const finalClasses = className ? `${baseClasses} ${className}` : baseClasses

  if (avatarUrl) {
    return <img src={avatarUrl} alt="Avatar" className={finalClasses} />
  }

  return <div className={`${finalClasses} bg-gray-300`} />
}
