'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, setIsPending] = useState(false)

  const t = {
    en: {
      title: 'Reset Password',
      desc: "Enter your email and we'll send reset instructions.",
      email: 'Email',
      button: 'Send Instructions',
      back: 'Back to Sign In',
    },
    ru: {
      title: 'Сброс пароля',
      desc: 'Введите email — отправим инструкции по сбросу пароля.',
      email: 'Email',
      button: 'Отправить инструкции',
      back: 'Вернуться к входу',
    },
  }[locale] ?? {
    title: 'Reset Password', desc: "Enter your email and we'll send reset instructions.",
    email: 'Email', button: 'Send Instructions', back: 'Back to Sign In',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('locale', locale)
    const result = await forgotPassword(fd)
    if (result?.error) setError(result.error)
    if (result?.success && result.message) setSuccess(result.message)
    setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🔑</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{t.title}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t.desc}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-green-600 font-medium">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <input name="email" type="email" required autoComplete="email" className="input" />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <button type="submit" disabled={isPending} className="btn-primary w-full">
                {isPending ? '...' : t.button}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href={`/${locale}/login`} className="text-sm text-primary-500 hover:underline">
            ← {t.back}
          </Link>
        </p>
      </div>
    </div>
  )
}
