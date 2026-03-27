import { cn } from "@/lib/utils"

const avatarColors = [
  "bg-indigo-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-green-500"
]

function getHash(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "U"
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface ClientAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ClientAvatar({ name, size = "md", className }: ClientAvatarProps) {
  const hash = getHash(name || "Unknown")
  const colorIndex = hash % avatarColors.length
  const bgColor = avatarColors[colorIndex]
  const initials = getInitials(name || "Unknown")

  const sizeClasses = {
    sm: "w-8 h-8 text-[9px]",
    md: "w-10 h-10 text-[10px]",
    lg: "w-16 h-16 text-sm",
    xl: "w-20 h-20 text-base",
  }

  return (
    <div 
      className={cn(
        "rounded-sm flex items-center justify-center font-mono tracking-widest uppercase text-white shrink-0 overflow-hidden",
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
