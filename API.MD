# Party API

## Быстрый сценарий использования

Ниже типовой пайплайн работы с API Party для двух пользователей.

1. Пользователь A регистрируется через `POST /api/auth/register`.
2. Пользователь A логинится через `POST /auth/login` и получает `accessToken` и `refreshToken`.
3. Пользователь B проходит тот же путь: `POST /api/auth/register`, затем `POST /auth/login`.
4. Пользователь A создает пати через `POST /parties`, передавая `partyName`, `partyGame`, `totalMembers`. Создатель добавляется в пати автоматически.
5. При необходимости пользователь A может посмотреть свои пати через `GET /users/me/parties` или все доступные пати через `GET /parties`.
6. Если пользователь A хочет пригласить конкретного друга, он вызывает `POST /parties/{partyId}/invites` и передает `toUserId` пользователя B.
7. Пользователь B принимает приглашение через `POST /invites/{inviteId}/accept` и становится участником пати.
8. Альтернативный путь без приглашения: пользователь B может сам вступить в открытую пати через `POST /parties/{partyId}/join`, если в ней есть свободные места.
9. После этого оба пользователя могут получать полную информацию о пати через `GET /parties/{partyId}`.
10. Если состав нужно изменить, создатель может исключить участника через `POST /parties/{partyId}/kick`, обновить параметры пати через `PATCH /parties/{partyId}` или удалить пати через `DELETE /parties/{partyId}`.

Для всех защищенных методов после логина нужно передавать заголовок:

```text
Authorization: Bearer <accessToken>
```

## Пояснение для фронтенда

Коротко по поиску и спискам:

- `GET /parties` возвращает общий список пати. Если передать `partyGame`, фильтр будет точным.
- `GET /parties/search` нужен для поиска. Он поддерживает `partyName`, `partyGame`, `keyword` и `keywords`.
- `keyword` можно передавать несколько раз, `keywords` можно передавать строкой через запятую.
- Для поиска нужно передать хотя бы один из параметров: `partyName`, `partyGame`, `keyword` или `keywords`.
- Если передано несколько параметров поиска сразу, они применяются вместе через `AND`.
- И краткая, и полная модель пати уже возвращают `description`, `address`, `keywords`; полная модель дополнительно возвращает владельца и участников.

Если смотреть на API с точки зрения клиентского приложения, поток работы обычно такой:

1. На экране регистрации фронт отправляет `POST /api/auth/register`.
2. После успешной регистрации пользователь переходит на экран логина или логинится автоматически через `POST /auth/login`.
3. После логина фронт сохраняет `accessToken` и использует его в `Authorization: Bearer <accessToken>` для всех защищенных запросов.
4. Для построения профиля и проверки текущей сессии фронт запрашивает `GET /users/me`.
5. На экране списка пати можно использовать:
   - `GET /parties` для общего списка
   - `GET /parties/search` для поиска по названию и игре
   - `GET /users/me/parties` для вкладки "Мои пати"
6. На экране создания пати фронт отправляет `POST /parties` с `partyName`, `partyGame`, `totalMembers` и при необходимости `listMembers`.
7. После создания или открытия карточки пати фронт получает полную модель через `GET /parties/{partyId}` и может показать владельца, участников, статус и лимит мест.
8. Если пользователь является создателем, фронт может показать действия управления:
   - `PATCH /parties/{partyId}` для редактирования
   - `POST /parties/{partyId}/invites` для приглашения друга
   - `POST /parties/{partyId}/kick` для исключения участника
   - `DELETE /parties/{partyId}` для удаления пати
9. Если пользователь не является участником, фронт может показать кнопку вступления через `POST /parties/{partyId}/join`.
10. Если пользователь уже состоит в пати, фронт может показать выход через `POST /parties/{partyId}/leave`.
11. Для экрана приглашений или уведомлений фронт может хранить `inviteId` после создания инвайта и использовать `POST /invites/{inviteId}/accept`, когда приглашенный пользователь принимает приглашение.

Практически это можно разложить по экранам так:

- `Register` -> `POST /api/auth/register`
- `Login` -> `POST /auth/login`
- `Profile` -> `GET /users/me`
- `Parties list` -> `GET /parties`, `GET /parties/search`
- `My parties` -> `GET /users/me/parties`
- `Create party` -> `POST /parties`
- `Party details` -> `GET /parties/{partyId}`
- `Party manage` -> `PATCH /parties/{partyId}`, `POST /parties/{partyId}/invites`, `POST /parties/{partyId}/kick`, `DELETE /parties/{partyId}`
- `Join/Leave actions` -> `POST /parties/{partyId}/join`, `POST /parties/{partyId}/leave`
- `Invite accept` -> `POST /invites/{inviteId}/accept`

Для фронта важно учитывать:

- ошибки API приходят в формате `{ "error": "...", "details": [] }`
- `details` полезно показывать в формах регистрации, логина, создания и редактирования пати
- `GET /parties` возвращает краткую модель пати, а `GET /parties/{partyId}` полную
- пагинация в списках идет через `limit` и `offset`
- после мутаций удобно заново запрашивать `GET /parties/{partyId}` или обновлять список локально на основе ответа API
- если `GET /users/me` вернул `401`, фронт должен считать сессию недействительной
- `refreshToken` возвращается при логине, но отдельного endpoint обновления токена в текущем API не описано
  поэтому повторная авторизация должна быть предусмотрена на уровне UX
  или отдельно реализована позже
  сейчас это ограничение API, а не фронта

Базовый префикс API:

```text
/api
```

Формат данных:

- `Content-Type: application/json`
- все даты возвращаются в ISO 8601
- защищенные методы требуют заголовок:

```text
Authorization: Bearer <accessToken>
```

## Общие типы ответов

### Ошибка

```json
{
  "error": "Validation error",
  "details": [
    "email must be a valid email address"
  ]
}
```

Поля:

- `error`: строка с общим описанием ошибки
- `details`: массив строк с деталями валидации, опционален

### Пользователь

```json
{
  "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
  "email": "user@example.com",
  "username": "player_one",
  "createdAt": "2026-04-05T10:18:26.585Z"
}
```

### Краткая модель пати

```json
{
  "id": "d885e22e-d919-4bac-9f64-4e97f75875c7",
  "partyName": "Ranked Push",
  "partyGame": "Dota 2",
  "totalMembers": 3,
  "currentMembers": 2,
  "status": "open",
  "ownerId": "3ff64295-5671-4ab9-bd8e-3808e486a422",
  "ownerUsername": "player_one",
  "createdAt": "2026-04-05T10:18:29.135Z"
}
```

### Полная модель пати

```json
{
  "id": "d885e22e-d919-4bac-9f64-4e97f75875c7",
  "partyName": "Ranked Push",
  "partyGame": "Dota 2",
  "description": "Evening ranked session",
  "address": "Moscow, Red Square",
  "keywords": ["ranked", "voice"],
  "totalMembers": 3,
  "currentMembers": 2,
  "status": "open",
  "ownerId": "3ff64295-5671-4ab9-bd8e-3808e486a422",
  "ownerUsername": "player_one",
  "createdAt": "2026-04-05T10:18:29.135Z",
  "owner": {
    "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
    "email": "user@example.com",
    "username": "player_one"
  },
  "members": [
    {
      "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
      "email": "user@example.com",
      "username": "player_one",
      "createdAt": "2026-04-05T10:18:26.585Z",
      "membershipId": "4ef433bf-05b1-475a-9e69-83ddf68d7ff3"
    }
  ]
}
```

### Список пати

```json
{
  "items": [],
  "limit": 10,
  "offset": 0
}
```

### Инвайт

```json
{
  "id": "f05c4fd5-588e-4e41-8c6b-b2f63e8ce0dd",
  "partyId": "472c8947-dfa2-4e55-9db4-0a5458c96e41",
  "toUser": {
    "id": "19aa26ae-58de-41bf-81c5-d10f66c32fb5",
    "email": "invitee@example.com",
    "username": "invitee"
  },
  "status": "pending",
  "createdAt": "2026-04-05T10:35:30.841Z"
}
```

## Статусы пати

Поддерживаемые значения поля `status`:

- `open`
- `closed`
- `in_game`

## Аутентификация

### POST /api/auth/register

Создает нового пользователя.

Тело запроса:

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "username": "player_one"
}
```

Обязательные поля:

- `email`: строка, валидный email
- `password`: строка, минимум 6 символов
- `username`: строка, минимум 3 символа

Успешный ответ `201`:

```json
{
  "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
  "email": "user@example.com",
  "username": "player_one",
  "createdAt": "2026-04-05T10:18:26.585Z"
}
```

Возможные ответы:

- `201` пользователь создан
- `400` ошибка валидации
- `409` пользователь уже существует

### POST /auth/login

Выполняет вход пользователя.

Тело запроса:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Обязательные поля:

- `email`: строка
- `password`: строка

Успешный ответ `200`:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

Возможные ответы:

- `200` успешный вход
- `400` ошибка валидации
- `401` неверный email или пароль

## Пользователь

### GET /users/me

Возвращает данные текущего пользователя.

Авторизация:

- Bearer token обязателен

Успешный ответ `200`:

```json
{
  "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
  "email": "user@example.com",
  "username": "player_one",
  "createdAt": "2026-04-05T10:18:26.585Z"
}
```

Возможные ответы:

- `200` успех
- `401` отсутствует или недействителен токен

### GET /users/me/parties

Возвращает список пати, в которых состоит текущий пользователь.

Авторизация:

- Bearer token обязателен

Query params:

- `limit`: число от 1 до 100, опционально, по умолчанию `20`
- `offset`: число от 0, опционально, по умолчанию `0`

Успешный ответ `200`:

```json
{
  "items": [
    {
      "id": "472c8947-dfa2-4e55-9db4-0a5458c96e41",
      "partyName": "Searchable Squad",
      "partyGame": "Apex Legends",
      "totalMembers": 4,
      "currentMembers": 2,
      "status": "open",
      "ownerId": "756e1c7f-fe65-4456-b1d8-3f41a2b363fa",
      "ownerUsername": "extra-owner_1775396124",
      "createdAt": "2026-04-05T10:35:27.960Z"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

Возможные ответы:

- `200` успех
- `400` ошибка пагинации
- `401` отсутствует или недействителен токен

## Пати

### POST /parties

Создает новую пати.

Авторизация:

- Bearer token обязателен

Тело запроса:

```json
{
  "partyName": "Ranked Push",
  "partyGame": "Dota 2",
  "totalMembers": 3,
  "listMembers": [
    "6571556f-d029-4022-9af9-2b919af60c46"
  ]
}
```

Обязательные поля:

- `partyName`: строка
- `partyGame`: строка
- `totalMembers`: целое число > 0

Опциональные поля:

- `listMembers`: массив `userId`

Правила:

- создатель добавляется в пати автоматически
- `totalMembers` не может быть меньше фактического количества участников
- все `listMembers` должны существовать

Успешный ответ `201`:

```json
{
  "id": "d885e22e-d919-4bac-9f64-4e97f75875c7",
  "partyName": "Ranked Push",
  "partyGame": "Dota 2",
  "totalMembers": 3,
  "currentMembers": 2,
  "status": "open",
  "createdAt": "2026-04-05T10:18:29.135Z",
  "owner": {
    "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
    "email": "user@example.com",
    "username": "player_one"
  },
  "members": []
}
```

Возможные ответы:

- `201` пати создана
- `400` ошибка валидации
- `401` отсутствует или недействителен токен

### GET /parties

Возвращает список всех пати.

Query params:

- `partyGame`: точный фильтр по игре, опционально
- `limit`: число от 1 до 100, опционально, по умолчанию `20`
- `offset`: число от 0, опционально, по умолчанию `0`

Успешный ответ `200`:

```json
{
  "items": [
    {
      "id": "d885e22e-d919-4bac-9f64-4e97f75875c7",
      "partyName": "Ranked Push",
      "partyGame": "Dota 2",
      "totalMembers": 3,
      "currentMembers": 2,
      "status": "open",
      "ownerId": "3ff64295-5671-4ab9-bd8e-3808e486a422",
      "ownerUsername": "player_one",
      "createdAt": "2026-04-05T10:18:29.135Z"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

Возможные ответы:

- `200` успех
- `400` ошибка пагинации

### GET /parties/search

Поиск пати по названию, игре и/или ключевым словам.

Query params:

- `partyName`: строка, опционально
- `partyGame`: строка, опционально
- `keyword`: query-параметр можно передавать несколько раз
- `keywords`: строка со списком через запятую
- `limit`: число от 1 до 100, опционально, по умолчанию `20`
- `offset`: число от 0, опционально, по умолчанию `0`

Правила:

- должен быть передан хотя бы один параметр: `partyName`, `partyGame`, `keyword` или `keywords`
- `partyName` и `partyGame` ищутся по частичному совпадению
- `keyword` и `keywords` ищут по пересечению с массивом `keywords` в пати
- если передано несколько параметров сразу, фильтры применяются вместе через `AND`

Успешный ответ `200`:

```json
{
  "items": [
    {
      "id": "472c8947-dfa2-4e55-9db4-0a5458c96e41",
      "partyName": "Searchable Squad",
      "partyGame": "Apex Legends",
      "description": "Looking for two more players",
      "address": "Discord",
      "keywords": ["ranked", "mic"],
      "totalMembers": 4,
      "currentMembers": 2,
      "status": "open",
      "ownerId": "756e1c7f-fe65-4456-b1d8-3f41a2b363fa",
      "ownerUsername": "extra-owner_1775396124",
      "createdAt": "2026-04-05T10:35:27.960Z"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

Возможные ответы:

- `200` успех
- `400` не переданы параметры поиска или ошибка пагинации

### GET /parties/{partyId}

Возвращает полную информацию о пати.

Успешный ответ `200`:

```json
{
  "id": "d885e22e-d919-4bac-9f64-4e97f75875c7",
  "partyName": "Ranked Push",
  "partyGame": "Dota 2",
  "totalMembers": 3,
  "currentMembers": 2,
  "status": "open",
  "createdAt": "2026-04-05T10:18:29.135Z",
  "owner": {
    "id": "3ff64295-5671-4ab9-bd8e-3808e486a422",
    "email": "user@example.com",
    "username": "player_one"
  },
  "members": []
}
```

Возможные ответы:

- `200` успех
- `404` пати не найдена

### POST /parties/{partyId}/join

Добавляет текущего пользователя в пати.

Авторизация:

- Bearer token обязателен

Тело запроса:

- не требуется

Успешный ответ `200`:

- полная модель пати

Возможные ответы:

- `200` пользователь добавлен
- `401` отсутствует или недействителен токен
- `404` пати не найдена
- `409` пользователь уже в пати
- `409` пати заполнена

### POST /parties/{partyId}/leave

Удаляет текущего пользователя из пати.

Авторизация:

- Bearer token обязателен

Тело запроса:

- не требуется

Успешный ответ `200`:

- полная модель пати

Возможные ответы:

- `200` пользователь вышел
- `401` отсутствует или недействителен токен
- `403` создатель не может выйти из собственной пати
- `404` пати не найдена
- `404` пользователь не состоит в пати

### POST /parties/{partyId}/kick

Удаляет участника из пати. Доступно только создателю.

Авторизация:

- Bearer token обязателен

Тело запроса:

```json
{
  "memberId": "77238175-b2c9-487d-897e-50d011a97765"
}
```

Обязательные поля:

- `memberId`: `userId` участника, которого нужно исключить

Успешный ответ `200`:

- полная модель пати

Возможные ответы:

- `200` участник удален
- `400` не передан `memberId`
- `400` создатель пытается кикнуть сам себя
- `401` отсутствует или недействителен токен
- `403` текущий пользователь не создатель пати
- `404` пати не найдена
- `404` пользователь не состоит в пати

### DELETE /parties/{partyId}

Удаляет пати. Доступно только создателю.

Авторизация:

- Bearer token обязателен

Успешный ответ `204`:

- пустое тело

Возможные ответы:

- `204` пати удалена
- `401` отсутствует или недействителен токен
- `403` текущий пользователь не создатель пати
- `404` пати не найдена

### PATCH /parties/{partyId}

Обновляет данные пати.

Авторизация:

- Bearer token обязателен

Тело запроса:

```json
{
  "partyName": "Ranked Grind",
  "partyGame": "CS2",
  "totalMembers": 4,
  "status": "in_game"
}
```

Все поля опциональны, но хотя бы одно должно быть передано.

Поддерживаемые поля:

- `partyName`: строка
- `partyGame`: строка
- `totalMembers`: целое число > 0
- `status`: `open | closed | in_game`

Правила:

- менять может только создатель
- `totalMembers` не может быть меньше текущего количества участников
- если `status` не передан, он будет пересчитан автоматически, кроме случая когда пати уже `in_game`

Успешный ответ `200`:

- полная модель пати

Возможные ответы:

- `200` успех
- `400` ошибка валидации
- `401` отсутствует или недействителен токен
- `403` текущий пользователь не создатель пати
- `404` пати не найдена

## Приглашения

### POST /parties/{partyId}/invites

Создает приглашение в пати. Доступно только создателю.

Авторизация:

- Bearer token обязателен

Тело запроса:

```json
{
  "toUserId": "19aa26ae-58de-41bf-81c5-d10f66c32fb5"
}
```

Обязательные поля:

- `toUserId`: `userId` пользователя, которого нужно пригласить

Успешный ответ `201`:

```json
{
  "id": "f05c4fd5-588e-4e41-8c6b-b2f63e8ce0dd",
  "partyId": "472c8947-dfa2-4e55-9db4-0a5458c96e41",
  "toUser": {
    "id": "19aa26ae-58de-41bf-81c5-d10f66c32fb5",
    "email": "invitee@example.com",
    "username": "invitee"
  },
  "status": "pending",
  "createdAt": "2026-04-05T10:35:30.841Z"
}
```

Возможные ответы:

- `201` приглашение создано
- `400` не передан `toUserId`
- `401` отсутствует или недействителен токен
- `403` текущий пользователь не создатель пати
- `404` пати не найдена
- `404` целевой пользователь не найден
- `409` пользователь уже состоит в пати

### POST /invites/{inviteId}/accept

Принимает приглашение.

Авторизация:

- Bearer token обязателен

Тело запроса:

- не требуется

Успешный ответ `200`:

- полная модель пати

Возможные ответы:

- `200` приглашение принято
- `401` отсутствует или недействителен токен
- `403` приглашение принадлежит другому пользователю
- `404` приглашение не найдено
- `409` приглашение уже обработано
- `409` пользователь уже состоит в пати
- `409` пати заполнена
