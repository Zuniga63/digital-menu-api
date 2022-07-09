export default class InvalidSignInError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidSignInError);
    }
    this.name = 'InvalidSignInError';
    this.message = message;
  }
}
