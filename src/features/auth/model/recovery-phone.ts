// Передаём данные только в памяти: не помещаем телефон, пароль или токен в адреса и хранилища.
let phone = "";

export function formatRecoveryPhone(value: string): string {
  return value.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 $1 $2-$3-$4");
}

export function rememberRecoveryPhone(value: string): void {
  phone = value;
}

export function peekRecoveryPhone(): string {
  return phone;
}

export function takeRecoveryPhone(): string {
  const value = phone;
  phone = "";
  return value;
}
