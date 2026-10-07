/**
 * Detect an OTP, passkey, or verification code in an email body.
 * Returns the digits string (4-8) or null.
 */
export function detectOtp(body: string): string | null {
  if (!body) return null;

  const keyword =
    /(?:otp|one[-\s]?time(?:\s+password)?|passkey|pass\s?code|verification(?:\s+code)?|security\s+code|code|pin)\b[^\d]{0,40}((?:\d[\s-]?){4,8})/i;
  const match = body.match(keyword);

  if (match) {
    const digits = match[1].replace(/\D/g, "");
    if (digits.length >= 4 && digits.length <= 8) return digits;
  }

  const standalone = body.match(/(?:^|\n)\s*(\d{6})\s*(?:\n|$)/);
  if (standalone) return standalone[1];

  return null;
}
