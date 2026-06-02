export const ADMIN_EMAIL = "vannaden@gmail.com";
export const ADMIN_PASSWORD = "12345678";
export const ADMIN_OPEN_ID = `admin:${ADMIN_EMAIL}`;

export function isAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
