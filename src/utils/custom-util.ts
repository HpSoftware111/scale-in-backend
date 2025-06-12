export const generateOtpCode = () => {
  const otpCode = Math.floor(Math.random() * (999_999 - 100_000 + 1)) + 100_000;

  return otpCode.toString();
};

export const generateRandomString = (length: number) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
};

export const getDiffDays = (date1: Date, date2: Date) => {
  const millisecondsDiff = date2.getTime() - date1.getTime();
  const aDayInMs = 24 * 60 * 60 * 1000;

  if (millisecondsDiff < 0) return -Math.round(Math.abs(millisecondsDiff) / aDayInMs);

  return Math.round(millisecondsDiff / aDayInMs);
};
