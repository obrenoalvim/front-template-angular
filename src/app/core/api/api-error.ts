// src/app/core/api/api-error.ts
export interface ApiErrorShape {
  status: number;
  message: string;
  body: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
