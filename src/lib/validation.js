function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export const PARTY_STATUSES = ["open", "closed", "in_game"];
export const USER_GENDERS = ["male", "female", "other"];

const AUTH_VALIDATION_MESSAGES = {
  emailInvalid: "Укажите корректный email",
  usernameRequired: "Укажите имя пользователя",
  usernameMin: "Имя пользователя должно содержать минимум 3 символа",
  passwordRequired: "Укажите пароль",
  passwordMin: "Пароль должен содержать минимум 6 символов",
};

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput(body) {
  const details = [];

  if (!isNonEmptyString(body.email) || !validateEmail(body.email)) {
    details.push(AUTH_VALIDATION_MESSAGES.emailInvalid);
  }

  if (!isNonEmptyString(body.username)) {
    details.push(AUTH_VALIDATION_MESSAGES.usernameRequired);
  } else if (body.username.trim().length < 3) {
    details.push(AUTH_VALIDATION_MESSAGES.usernameMin);
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    details.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
  } else if (body.password.length < 6) {
    details.push(AUTH_VALIDATION_MESSAGES.passwordMin);
  }

  if (body.age !== undefined && body.age !== null) {
    if (!Number.isInteger(body.age) || body.age < 1 || body.age > 120) {
      details.push("Возраст должен быть целым числом от 1 до 120");
    }
  }

  if (body.gender !== undefined && body.gender !== null) {
    if (typeof body.gender !== "string") {
      details.push("Пол должен быть строкой");
    } else if (body.gender.trim() !== "" && !USER_GENDERS.includes(body.gender)) {
      details.push("Пол должен быть одним из значений: male, female, other");
    }
  }

  if (body.city !== undefined && body.city !== null) {
    if (typeof body.city !== "string") {
      details.push("Город должен быть строкой");
    }
  }

  if (body.interests !== undefined && body.interests !== null) {
    if (!Array.isArray(body.interests)) {
      details.push("Интересы должны быть массивом строк");
    } else if (body.interests.some((interest) => typeof interest !== "string")) {
      details.push("Каждый интерес должен быть строкой");
    }
  }

  return details;
}

export function validateLoginInput(body) {
  const details = [];

  if (!isNonEmptyString(body.email) || !validateEmail(body.email)) {
    details.push(AUTH_VALIDATION_MESSAGES.emailInvalid);
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    details.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
  } else if (body.password.length < 6) {
    details.push(AUTH_VALIDATION_MESSAGES.passwordMin);
  }

  return details;
}

export function validatePartyPayload(body, { partial = false } = {}) {
  const details = [];

  if (!partial || body.partyName !== undefined) {
    if (typeof body.partyName !== "string") {
      details.push("Название пати обязательно");
    }
  }

  if (!partial || body.partyGame !== undefined) {
    if (typeof body.partyGame !== "string") {
      details.push("Игра обязательна");
    }
  }

  if (!partial || body.totalMembers !== undefined) {
    if (!Number.isInteger(body.totalMembers) || body.totalMembers < 1) {
      details.push("Количество участников должно быть целым числом больше 0");
    }
  }

  if (!partial || body.listMembers !== undefined) {
    if (
      body.listMembers !== undefined &&
      (!Array.isArray(body.listMembers) ||
        body.listMembers.some((memberId) => !isNonEmptyString(memberId)))
    ) {
      details.push("Список участников должен быть массивом идентификаторов пользователей");
    }
  }

  if (!partial || body.description !== undefined) {
    if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
      details.push("Описание должно быть строкой");
    }
  }

  if (!partial || body.address !== undefined) {
    if (body.address !== undefined && body.address !== null && typeof body.address !== "string") {
      details.push("Адрес должен быть строкой");
    }
  }

  if (!partial || body.keywords !== undefined) {
    if (
      body.keywords !== undefined &&
      body.keywords !== null &&
      (!Array.isArray(body.keywords) || body.keywords.some((keyword) => typeof keyword !== "string"))
    ) {
      details.push("Ключевые слова должны быть массивом строк");
    }
  }

  if (!partial || body.status !== undefined) {
    if (
      body.status !== undefined &&
      (!isNonEmptyString(body.status) || !PARTY_STATUSES.includes(body.status))
    ) {
      details.push("Статус должен быть одним из значений: open, closed, in_game");
    }
  }

  return details;
}

export function parsePagination(searchParams) {
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const parsedLimit = limit === null ? 20 : Number(limit);
  const parsedOffset = offset === null ? 0 : Number(offset);
  const details = [];

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    details.push("limit должен быть целым числом от 1 до 100");
  }

  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    details.push("offset должен быть целым числом больше или равным 0");
  }

  return {
    details,
    limit: parsedLimit,
    offset: parsedOffset,
  };
}
