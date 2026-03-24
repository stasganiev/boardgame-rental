'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  locale: z.string().default('en'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  locale: z.string().default('en'),
})

export type AuthResult = {
  error?: string
  success?: boolean
  message?: string
}

export async function register(formData: FormData): Promise<AuthResult> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    locale: (formData.get('locale') as string) || 'en',
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { error: firstError.message }
  }

  const { name, email, password, locale } = parsed.data
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: locale === 'ru' ? 'Этот email уже зарегистрирован' : 'Email already registered' }
    }
    return { error: error.message }
  }

  return {
    success: true,
    message:
      locale === 'ru'
        ? 'Проверьте почту для подтверждения аккаунта'
        : 'Check your email to confirm your account',
  }
}

export async function login(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    locale: (formData.get('locale') as string) || 'en',
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, password, locale } = parsed.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return {
        error: locale === 'ru' ? 'Неверный email или пароль' : 'Invalid email or password',
      }
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        error:
          locale === 'ru'
            ? 'Подтвердите email перед входом'
            : 'Please confirm your email before signing in',
      }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}`)
}

export async function logout(locale: string = 'en'): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(`/${locale}/login`)
}

export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const locale = (formData.get('locale') as string) || 'en'

  if (!email || !z.string().email().safeParse(email).success) {
    return { error: locale === 'ru' ? 'Введите корректный email' : 'Enter a valid email' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/reset-password`,
  })

  if (error) return { error: error.message }

  return {
    success: true,
    message:
      locale === 'ru'
        ? 'Инструкции отправлены на вашу почту'
        : 'Password reset instructions sent to your email',
  }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get('password') as string
  const locale = (formData.get('locale') as string) || 'en'

  if (!password || password.length < 8) {
    return {
      error:
        locale === 'ru' ? 'Пароль должен быть не менее 8 символов' : 'Password must be at least 8 characters',
    }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect(`/${locale}`)
}
