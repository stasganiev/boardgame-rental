'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const t = {
    en: {
      title: 'Welcome Back',
      email: 'Email',
      password: 'Password',
      forgot: 'Forgot password?',
      button: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
    },
    ru: {
      title: 'Добро пожаловать',
      email: 'Email',
      password: 'Пароль',
      forgot: 'Забыли пароль?',
      button: 'Войти',
      noAccount: 'Нет аккаунта?',
      signUp: 'Зарегистрироваться',
    },
  }[locale] ?? {
    title: 'Welcome Back', email: 'Email', password: 'Password',
    forgot: 'Forgot password?', button: 'Sign In', noAccount: "Don't have an account?", signUp: 'Sign Up',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('locale', locale)
    const result = await login(fd)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // On success: server action redirects
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🎲</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{t.title}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input name="email" type="email" required autoComplete="email" className="input" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">{t.password}</label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary-500 hover:underline"
                >
                  {t.forgot}
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
              />
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
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.noAccount}{' '}
          <Link href={`/${locale}/register`} className="text-primary-500 font-medium hover:underline">
            {t.signUp}
          </Link>
        </p>
      </div>
    </div>
  )
}
