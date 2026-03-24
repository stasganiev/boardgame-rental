import type { Contact } from '@/types'
import { cn } from '@/lib/utils'

interface ContactBadgeProps {
  contact: Contact
  locale?: string
}

const icons: Record<string, string> = {
  phone: '📞',
  telegram: '✈️',
  whatsapp: '💬',
  email: '✉️',
  other: '🔗',
}

const labels: Record<string, Record<string, string>> = {
  en: { phone: 'Phone', telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'Email', other: 'Contact' },
  ru: { phone: 'Телефон', telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'Email', other: 'Контакт' },
}

export function ContactBadge({ contact, locale = 'en' }: ContactBadgeProps) {
  const t = labels[locale] ?? labels.en
  const icon = icons[contact.type] ?? '🔗'
  const label = t[contact.type] ?? contact.type

  const href =
    contact.type === 'telegram'
      ? `https://t.me/${contact.value.replace('@', '')}`
      : contact.type === 'whatsapp'
      ? `https://wa.me/${contact.value.replace(/\D/g, '')}`
      : contact.type === 'email'
      ? `mailto:${contact.value}`
      : contact.type === 'phone'
      ? `tel:${contact.value}`
      : undefined

  const content = (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full px-3 py-1 transition-colors">
      <span>{icon}</span>
      <span className="font-medium">{label}:</span>
      <span>{contact.value}</span>
    </span>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return <div>{content}</div>
}
