function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export const PARTY_STATUSES = ["open", "closed", "in_game"];

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput(body) {
  const details = [];

  if (!validateEmail(body.email)) {
    details.push("email must be a valid email address");
  }

  if (!isNonEmptyString(body.username) || body.username.trim().length < 3) {
    details.push("username must be at least 3 characters long");
  }

  if (!isNonEmptyString(body.password) || body.password.length < 6) {
    details.push("password must be at least 6 characters long");
  }

  return details;
}

export function validateLoginInput(body) {
  const details = [];

  if (!validateEmail(body.email)) {
    details.push("email must be a valid email address");
  }

  if (!isNonEmptyString(body.password)) {
    details.push("password is required");
  }

  return details;
}

export function validatePartyPayload(body, { partial = false } = {}) {
  const details = [];

  if (!partial || body.partyName !== undefined) {
    if (!isNonEmptyString(body.partyName)) {
      details.push("partyName is required");
    }
  }

  if (!partial || body.partyGame !== undefined) {
    if (!isNonEmptyString(body.partyGame)) {
      details.push("partyGame is required");
    }
  }

  if (!partial || body.totalMembers !== undefined) {
    if (!Number.isInteger(body.totalMembers) || body.totalMembers < 1) {
      details.push("totalMembers must be an integer greater than 0");
    }
  }

  if (!partial || body.listMembers !== undefined) {
    if (
      body.listMembers !== undefined &&
      (!Array.isArray(body.listMembers) ||
        body.listMembers.some((memberId) => !isNonEmptyString(memberId)))
    ) {
      details.push("listMembers must be an array of user ids");
    }
  }

  if (!partial || body.status !== undefined) {
    if (
      body.status !== undefined &&
      (!isNonEmptyString(body.status) || !PARTY_STATUSES.includes(body.status))
    ) {
      details.push("status must be one of: open, closed, in_game");
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
    details.push("limit must be an integer between 1 and 100");
  }

  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    details.push("offset must be an integer greater than or equal to 0");
  }

  return {
    details,
    limit: parsedLimit,
    offset: parsedOffset,
  };
}
