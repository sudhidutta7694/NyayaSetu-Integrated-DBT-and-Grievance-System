/**
 * Token storage utilities
 * Stores tokens in both localStorage (for client-side access) and cookies (for middleware access)
 */

export const tokenStorage = {
  /**
   * Save token to both localStorage and cookies
   */
  setToken: (token: string) => {
    if (typeof window === 'undefined') return

    // Store in localStorage for client-side access
    localStorage.setItem('access_token', token)

    // Store in cookie for middleware access
    // Set cookie with 7 days expiry, httpOnly is not set so JS can access it
    document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`
  },

  /**
   * Get token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  /**
   * Remove token from both localStorage and cookies
   */
  removeToken: () => {
    if (typeof window === 'undefined') return

    // Remove from localStorage
    localStorage.removeItem('access_token')

    // Remove from cookies by setting expiry to past date
    document.cookie = 'access_token=; path=/; max-age=0; samesite=strict'
  },

  /**
   * Check if token exists
   */
  hasToken: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('access_token')
  },
}
