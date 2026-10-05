import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY =
  'vojugo_refresh_token';

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(
  token: string | null
) {
  accessToken = token;
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(
    REFRESH_TOKEN_KEY
  );
}

export async function saveAuthTokens(
  access: string,
  refresh: string
) {
  accessToken = access;

  await SecureStore.setItemAsync(
    REFRESH_TOKEN_KEY,
    refresh
  );
}

export async function clearAuthTokens() {
  accessToken = null;

  await SecureStore.deleteItemAsync(
    REFRESH_TOKEN_KEY
  );
}