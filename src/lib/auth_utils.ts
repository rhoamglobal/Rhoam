export const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

// Single source of truth for password rules, used by login, signup, and
// reset-password. Previously each form hardcoded its own "min 6 chars"
// check independently — fine as long as all three happened to agree, but
// nothing enforced that, and none of them were verified against the
// actual configured minimum in Supabase Auth's project settings. If that
// project setting is ever changed, update PASSWORD_MIN_LENGTH here (and
// double check it still matches Supabase Auth > Policies) rather than
// hunting down three separate copies of the same number.
export const PASSWORD_MIN_LENGTH = 6;

export function getPasswordError(password: string): string {
  if (!password) return "";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Min ${PASSWORD_MIN_LENGTH} characters`;
  }
  return "";
}