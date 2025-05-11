export function successResponse(message: string, data: unknown = {}) {
  return {
    message,
    data,
  };
}

export function errorResponse(message: string) {
  return {
    message,
  };
}
