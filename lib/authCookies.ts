export const SESSION_COOKIE = 'vyaparflow_session';
export const PERSONA_COOKIE = 'vyaparflow_active_role';
export const USER_ID_COOKIE = 'vyaparflow_active_user_id';
export const USER_EMAIL_COOKIE = 'vyaparflow_active_user_email';
export const USER_NAME_COOKIE = 'vyaparflow_active_user_name';

export const SECURE_SESSION_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
