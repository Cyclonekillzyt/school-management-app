export function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}
