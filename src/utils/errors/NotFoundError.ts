export default class NotFoundError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
    this.name = 'NotFoundError';
    this.message = message;
  }
}
