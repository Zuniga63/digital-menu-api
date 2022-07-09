import { Request, Response } from 'express';
import UserModel from '../models/User.model';
import createToken from '../utils/createToken';
import { sendRegisterMail } from '../utils/mailer';
import sendError from '../utils/sendError';

export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const user = await UserModel.create({ ...req.body });
    const token = createToken({ id: user.id });
    const mailInfo = await sendRegisterMail(user);
    res.status(201).json({ token, user, mailInfo });
  } catch (error) {
    sendError(error, res);
  }
}

export async function signIn(_req: Request, _res: Response): Promise<void> {
  //
}
