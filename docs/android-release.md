# Первая Android-сборка

## Проект и подпись

- Название приложения: «Вожуго».
- Android application ID: `ru.vozhugo.mobile`.
- Expo owner: `bboysquizs-team`.
- Expo slug: `vojugo-mobile`.
- EAS project ID: `c601c155-e58f-486f-9f22-7ad4e3dbbc00`.
- Проект: https://expo.dev/accounts/bboysquizs-team/projects/vojugo-mobile
- Android keystore создан и хранится в EAS Credentials.

Идентификатор и ключ подписи нужно сохранять для последующих обновлений.
Проект Expo используется для сборок, а Google Play — для распространения:
публикация остаётся в существующем аккаунте руководителя.

## Параметры сборки

Профиль `production` в `eas.json` создаёт Android App Bundle (`.aab`).
Номера сборок увеличиваются автоматически и хранятся в EAS.
Сама сборка не запускает отправку в Google Play.

## Первая техническая сборка, 02.11.2026

- Версия: `1.0.0`, Android versionCode: `2`.
- Сборка: https://expo.dev/accounts/bboysquizs-team/projects/vojugo-mobile/builds/ef171d8b-150a-4b27-8dce-cc364597b1a2
- Для проверки процесса сборки временно сохранён существующий адрес API:
  `https://hip-acm-follows-final.trycloudflare.com/api/v1`.
- Этот адрес задан в EAS environment `production`. Проверка соединения с компьютера
  завершилась тайм-аутом, актуальный адрес отложен до уточнения у backend.
- Такая сборка предназначена для технической проверки. Работу входа, заявок
  и восстановления пароля нельзя подтвердить без доступного API.
- После получения актуального адреса обновить переменную в EAS и собрать новую версию.

Перед сборкой для полноценного тестирования обновить в EAS environment `production`
переменную `EXPO_PUBLIC_API_BASE_URL`, указав актуальный HTTPS-адрес backend,
включая `/api/v1`.
Локальный `.env.local` исключён из архива сборки. Не записывать туда секреты
с префиксом `EXPO_PUBLIC_`: такие значения доступны в клиентском приложении.

```powershell
npx eas-cli@latest env:set --environment production --name EXPO_PUBLIC_API_BASE_URL --value https://YOUR_API_HOST/api/v1 --visibility plaintext --scope project --non-interactive
npx eas-cli@latest build --platform android --profile production
```

`YOUR_API_HOST` — пример: заменить настоящим адресом перед запуском команды.
Временный Cloudflare-адрес требует работающего туннеля и не подходит для
длительного закрытого тестирования или публичного релиза.

## Google Play

Владелец аккаунта завершает проверку личности, устройства Android и контактного
номера телефона. После этого администратор создаёт приложение, загружает `.aab`
во внутреннее тестирование и добавляет участников. APK напрямую из `.aab`
на телефоне не устанавливается: участники используют ссылку Google Play.

Для нового личного аккаунта перед публичным выпуском отдельно требуется закрытый
тест с 12 участниками, подключёнными непрерывно не менее 14 дней, и одобрение
заявки на доступ к Production. Внутреннее тестирование это требование не заменяет.
