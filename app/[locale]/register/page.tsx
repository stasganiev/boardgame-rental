'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

export default function RegisterPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, setIsPending] = useState(false)

  const t = {
    en: {
      title: 'Create Account',
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      passwordHint: 'At least 8 characters',
      button: 'Sign Up',
      hasAccount: 'Already have an account?',
      signIn: 'Sign In',
      terms: 'By signing up, you agree to use this platform responsibly.',
    },
    ru: {
      title: 'Создать аккаунт',
      name: 'Имя',
      email: 'Email',
      password: 'Пароль',
      passwordHint: 'Не менее 8 символов',
      button: 'Зарегистрироваться',
      hasAccount: 'Уже есть аккаунт?',
      signIn: 'Войти',
      terms: 'Регистрируясь, вы соглашаетесь использовать платформу ответственно.',
    },
  }[locale] ?? {
    title: 'Create Account', name: 'Full Name', email: 'Email', password: 'Password',
    passwordHint: 'At least 8 characters', button: 'Sign Up', hasAccount: 'Already have an account?',
    signIn: 'Sign In', terms: 'By signing up, you agree to use this platform responsibly.',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    setSuccess('')
    const fd = new FormData(e.currentTarget)
    fd.set('locale', locale)
    const result = await register(fd)
    if (result?.error) setError(result.error)
    if (result?.success && result.message) setSuccess(result.message)
    setIsPending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🎲</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{t.title}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-green-600 font-medium">{success}</p>
              <Link href={`/${locale}/login`} className="mt-4 block text-sm text-primary-500 hover:underline">
                {t.signIn}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                <input name="name" type="text" required autoComplete="name" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <input name="email" type="email" required autoComplete="email" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">{t.passwordHint}</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <button type="submit" disabled={isPending} className="btn-primary w-full">
                {isPending ? '...' : t.button}
              </button>
              <p className="text-xs text-gray-400 text-center">{t.terms}</p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.hasAccount}{' '}
          <Link href={`/${locale}/login`} className="text-primary-500 font-medium hover:underline">
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
