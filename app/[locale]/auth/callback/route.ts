import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = params.locale || 'en'
  const next = searchParams.get('next') ?? `/${locale}`

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_callback_error`)
}
