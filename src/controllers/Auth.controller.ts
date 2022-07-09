import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel, { IUser } from '../models/User.model';
import createToken from '../utils/createToken';
import { sendRegisterMail } from '../utils/mailer';
import sendError from '../utils/sendError';
import InvalidSignInError from '../utils/errors/InvalidSignInError';

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

export async function signIn(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const message: string = 'Correo o contraseña invalidos.';

    const user: IUser | null = await UserModel.findOne({ email });
    if (!user) throw new InvalidSignInError(message);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new InvalidSignInError(message);

    const token = createToken({ id: user.id });

    res.status(200).json({ ok: true, token });
  } catch (error) {
    sendError(error, res);
  }
}
