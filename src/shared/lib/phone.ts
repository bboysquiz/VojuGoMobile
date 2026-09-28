export function normalizePhoneInput(input: string): string {
  let value = input.replace(/[^\d+]/g, '');
  value = value.replace(/(?!^)\+/g, '');

  if (value.startsWith('8')) {
    value = `+7${value.slice(1)}`;
  } else if (value.startsWith('7')) {
    value = `+${value}`;
  }

  return value.startsWith('+7')
    ? value.slice(0, 12)
    : value;
}

export function isValidPhone(phone: string): boolean {
  return /^\+7\d{10}$/.test(phone);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 11) {
    return phone;
  }

  return `+${digits[0]} ${digits.slice(
    1,
    4
  )} ${digits.slice(4, 7)}-${digits.slice(
    7,
    9
  )}-${digits.slice(9, 11)}`;
}