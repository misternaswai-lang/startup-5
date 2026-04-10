# API (минималка)

## Что обязательно при создании

### `POST /register` (rewrite на `POST /api/auth/register`)

Обязательно:

- `email` (строка)
- `username` (строка)
- `password` (строка)

Необязательно (можно не передавать или передать пустым значением):

- `age` (число) — можно не передавать / `null`
- `gender` (строка) — можно не передавать / `""` / `null` (если не пустая, то `male|female|other`)
- `city` (строка) — можно не передавать / `""` / `null`
- `interests` (массив строк) — можно не передавать / `[]` / `null`

Позже можно обновить через `PATCH /api/users/me`.

### `POST /party/create` (rewrite на `POST /api/parties`)

Все поля **необязательные** (можно не передавать или передать пустым значением):

- `description` (строка)
- `address` (строка)
- `keywords` (массив строк)

Позже можно обновить через `PATCH /api/parties/{partyId}`.

---

# Навигация
</br>
</br>


- [Неделя 1](https://github.com/misternaswai-lang/startup-5/tree/week1)</br>
</br>

- [Неделя 2](https://github.com/misternaswai-lang/startup-5/tree/week2)</br>
</br>

- [Неделя 3](https://github.com/misternaswai-lang/startup-5/tree/week3)</br>
</br>

- [Неделя 4](https://github.com/misternaswai-lang/startup-5/tree/week4)</br>
</br>

- [Неделя 5](https://github.com/misternaswai-lang/startup-5/blob/week5/README.md)</br>
</br>

- [Неделя 6](https://github.com/misternaswai-lang/startup-5/blob/week6)</br>
</br>

- [Неделя 7](https://github.com/misternaswai-lang/startup-5/blob/week7/README.md)</br>
</br>
