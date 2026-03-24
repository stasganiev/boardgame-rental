'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/app/actions/auth'

export default function ResetPasswordPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const labels = {
    en: { title: 'Set New Password', password: 'New Password', button: 'Update Password' },
    ru: { title: 'Новый пароль', password: 'Новый пароль', button: 'Обновить пароль' },
  }
  const t = labels[locale as keyof typeof labels] ?? labels.en

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('locale', locale)
    const result = await resetPassword(fd)
    if (result?.error) setError(result.error)
    setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
            <input name="password" type="password" required minLength={8} className="input" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? '...' : t.button}
          </button>
        </form>
      </div>
    </div>
  )
}
