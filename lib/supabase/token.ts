/**
 * Extract the Supabase access token from cookies.
 * Works with both regular and chunked cookie formats from @supabase/ssr v0.10+.
 */
export function getAccessToken(): string | null {
  const cookies = document.cookie.split(';').map((c) => c.trim())

  // Find all sb-*-auth-token cookies (may be chunked: .0, .1, etc.)
  const authCookies = cookies
    .filter((c) => {
      const name = c.split('=')[0]
      return name.startsWith('sb-') && name.includes('-auth-token')
    })
    .sort((a, b) => a.split('=')[0].localeCompare(b.split('=')[0]))

  if (authCookies.length === 0) return null

  // Combine chunked cookie values
  let combined = authCookies
    .map((c) => c.substring(c.indexOf('=') + 1))
    .join('')

  // Handle base64url encoding (v0.10+ prefixes with "base64-")
  if (combined.startsWith('base64-')) {
    try {
      combined = atob(combined.substring(7).replace(/-/g, '+').replace(/_/g, '/'))
    } catch {
      return null
    }
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(combined))
    return parsed.access_token || null
  } catch {
    // Try without decodeURIComponent
    try {
      const parsed = JSON.parse(combined)
      return parsed.access_token || null
    } catch {
      return null
    }
  }
}
