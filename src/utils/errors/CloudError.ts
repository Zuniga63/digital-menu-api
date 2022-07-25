export default class CloudError extends Error {
  constructor(message: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CloudError);
    }
    this.name = 'CloudError';
    this.message = message;
  }
}
