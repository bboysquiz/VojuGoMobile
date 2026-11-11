# Иконки нижней навигации

Оригинальные SVG импортированы из Figma без изменения геометрии 11.11.2026.
Файл: https://www.figma.com/design/nDLrEkrJ18M09Nr3sXKkoN/Untitled?node-id=1-323

| Файл | Слой Figma | Использование |
| --- | --- | --- |
| nav-list.svg | Icon/nav-list, Default (`1:4`) | Заявки |
| nav-list-active.svg | Icon/nav-list, Active (`1:6`) | Активные заявки |
| nav-chat.svg | Icon/nav-chat (`1:734`) | Отклики |
| nav-clock.svg | Button/Icon/nav-clock (`1:737`) | История |
| nav-person.svg | Button/Icon/nav-person (`1:740`) | Профиль |
| nav-plus-ios.svg | Create Button, iOS (`1:326`) | Создание заявки, iOS |
| nav-plus-android.svg | Create Button, Android (`1:330`) | Создание заявки, Android |
| nav-truck.svg | Icon/nav-truck (`1:743`) | Моя техника в профиле |
| support.svg | Icon/Chat (`1:746`) | Поддержка в профиле |
| mail.svg | Icon / mail (`1:752`) | Почта в профиле |

Все SVG имеют исходный размер 24×24. Цвет активных вкладок применяется через
`tintColor`, исходные файлы не редактируются. Панель повторяет варианты
`1:361`, `1:368`, `1:376`, `1:383`: 56 pt на iOS, 64 dp на Android,
подписи Roboto 12/16, верхняя граница #c5c4bc. Системная область жестов
заполняется через SafeAreaView, её индикатор рисует ОС.
