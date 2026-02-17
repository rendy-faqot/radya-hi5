import * as LucideIcons from 'lucide-react'

export function getIcon(iconName: string): any {
  return (LucideIcons as any)[iconName] || LucideIcons.Award
}
