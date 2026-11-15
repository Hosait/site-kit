import {
  Award,
  BookOpen,
  Calendar,
  ChartColumn,
  Check,
  Clock,
  Globe,
  Handshake,
  Heart,
  House,
  Leaf,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Target,
  ThumbsUp,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import type { IconName } from './iconNames'

/** Inline SVG components bundled with the kit (lucide-react, ISC); no uploads, nothing fetched. */
export const ICONS: Record<IconName, LucideIcon> = {
  check: Check,
  star: Star,
  heart: Heart,
  shield: ShieldCheck,
  lock: Lock,
  clock: Clock,
  calendar: Calendar,
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  users: Users,
  home: House,
  tool: Wrench,
  lightbulb: Lightbulb,
  chart: ChartColumn,
  leaf: Leaf,
  award: Award,
  truck: Truck,
  message: MessageCircle,
  search: Search,
  settings: Settings,
  zap: Zap,
  'thumbs-up': ThumbsUp,
  book: BookOpen,
  globe: Globe,
  handshake: Handshake,
  target: Target,
  rocket: Rocket,
}

/** A decorative icon (the text next to it carries the meaning). Unknown names draw nothing. */
export function Icon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Svg = name ? (ICONS as Record<string, LucideIcon>)[name] : undefined
  return Svg ? <Svg aria-hidden="true" focusable="false" className={className} /> : null
}
