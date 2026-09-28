export function normalizePhoneInput(input: string): string {
  let value = input.replace(/[^\d+]/g, '');
  value = value.replace(/(?!^)\+/g, '');

  if (value.startsWith('8')) {
    value = `+7${value.slice(1)}`;
  } else if (value.startsWith('7')) {
    value = `+${value}`;
  }

  return value.startsWith('+7') ? value.slice(0, 12) : value;
}

export function isValidPhone(phone: string): boolean {
  return /^\+7\d{10}$/.test(phone);
}