/** Thrown by route handlers for expected, user-facing failures — the global
 * error handler maps this straight to `{ status, body: { error: message } }`
 * instead of a generic 500, so callers get an accurate status code. */
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new ApiError(400, message, fields);
  }
  static unauthorized(message = "Not authenticated") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Not permitted") {
    return new ApiError(403, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static conflict(message: string, fields?: Record<string, string>) {
    return new ApiError(409, message, fields);
  }
  static validation(fields: Record<string, string>) {
    return new ApiError(422, "Validation failed", fields);
  }
}
