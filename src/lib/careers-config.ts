export const DEFAULT_CAREERS_TO_EMAIL = "anthony@barbaro.tech";

export function getCareersRecipientEmail(): string {
  const configuredEmail =
    process.env.CAREERS_TO?.trim() || process.env.CAREERS_TO_EMAIL?.trim();

  if (configuredEmail) {
    return configuredEmail;
  }

  return DEFAULT_CAREERS_TO_EMAIL;
}
