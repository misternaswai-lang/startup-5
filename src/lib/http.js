import { NextResponse } from "next/server";

export function json(data, init) {
  return NextResponse.json(data, init);
}

export function error(status, message, details) {
  return json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}
