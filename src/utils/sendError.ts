import { Response } from 'express';

export interface IErrorInfo {
  message: string;
  ok: boolean;
  error?: any;
  validationErrors?: object;
}
/**
 * Response Code
 * 400: Bad Request
 * 401: Unauthorized
 * 403: Forbidden
 * 404: Not Found
 * 405: Method Not Allowed
 * 415: Unsupported Media Type
 *
 * 500 Internal Server Error
 * 511 Network Authentication Required
 */
export default function sendError(error: any, res: Response) {
  const { name: errorName, message }: { name: string; message: string } = error;
  let code: number = 500;
  const info: IErrorInfo = {
    message,
    ok: false,
  };

  switch (errorName) {
    case 'InvalidSignInError':
      code = 400;
      break;
    case 'ValidationError':
      info.message = 'Error de validación';
      info.validationErrors = error.errors;
      code = 400;
      break;
    case 'AuthError':
      code = 401;
      break;
    case 'NotFoundError':
      code = 404;
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(error);
      break;
  }

  res.status(code).json(info);
}
