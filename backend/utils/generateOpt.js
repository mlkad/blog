import crypto from 'crypto';

export function generateOtp() {
  // Генерирует 6-значное число (от 100000 до 999999)
  return crypto.randomInt(100000, 1000000).toString();
}
