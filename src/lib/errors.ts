interface ErrorLike {
  code?: string
  message?: string
}

/** Turns Supabase/driver errors into messages safe to show in the UI. */
export function toErrorMessage(error: unknown): string {
  const candidate = error as ErrorLike | null
  if (candidate?.code === '42501') {
    return 'You do not have access to this data. Try signing in again.'
  }
  if (candidate?.code === '23505') {
    return 'A record with that number already exists in your workspace.'
  }
  if (candidate?.message) return candidate.message
  return 'Something went wrong. Please try again.'
}

/** Maps Supabase auth errors to friendly copy for the login/signup screens. */
export function authErrorMessage(error: unknown): string {
  const candidate = error as ErrorLike | null
  const message = candidate?.message ?? ''
  const code = candidate?.code ?? ''

  if (code === 'invalid_credentials' || message.includes('Invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (code === 'email_not_confirmed' || message.includes('Email not confirmed')) {
    return 'Please confirm your email first — check your inbox for the confirmation link.'
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  if (code === 'weak_password' || message.includes('Password should be at least')) {
    return 'Please choose a stronger password (at least 8 characters).'
  }
  if (message) return message
  return 'Something went wrong. Please try again.'
}
