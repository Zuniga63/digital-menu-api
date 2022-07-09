import { Request, Response } from 'express';
import UserModel from '../models/User.model';
import createToken from '../utils/createToken';
import { sendRegisterMail } from '../utils/mailer';
import sendError from '../utils/sendError';

export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    // the first user is the admin of platform
    const userCount = await UserModel.count();
    const role = userCount ? 'USER' : 'ADMIN';

    const user = await UserModel.create({ ...req.body, role });
    const token = createToken({ id: user.id });
    await sendRegisterMail(user);

    res.status(201).json({ token, ok: true });
  } catch (error) {
    sendError(error, res);
  }
}

export async function signIn(_req: Request, _res: Response): Promise<void> {
  //
}
