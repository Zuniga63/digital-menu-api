import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import OptionSetModel, { IOptionSet } from '../models/OptionSet.model';
import OptionSetItemModel, {
  IOptionSetItem,
} from '../models/OptionSetItem.model';
import NotFoundError from '../utils/errors/NotFoundError';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

interface IStoreItem {
  name: string;
  image?: IImage;
  isEnabled?: boolean;
}

interface IStoreSet {
  name: string;
  isEnabled?: boolean;
  items: IStoreItem[];
}

export async function list(_req: Request, res: Response) {
  try {
    const optionSets = await OptionSetModel.find({}).populate('items');
    res.status(200).json({ ok: true, optionSets });
  } catch (error) {
    sendError(error, res);
  }
}

export async function store(req: Request, res: Response) {
  try {
    const { name, isEnabled, items }: IStoreSet = req.body;
    const setItems: HydratedDocument<IOptionSetItem>[] = [];

    if (typeof items !== 'object' || items.length <= 0) {
      throw new Error('El set de opciones no puede estár vacío.');
    }

    const optionSet: HydratedDocument<IOptionSet> = await OptionSetModel.create(
      { name, isEnabled }
    );

    await Promise.all(
      items.map(async (item, index) => {
        const optionSetItem = await OptionSetItemModel.create({
          optionSet: optionSet._id,
          name: item.name,
          order: index + 1,
          isEnabled: item.isEnabled,
        });

        optionSet.items.push(optionSetItem._id);

        setItems.push(optionSetItem);
      })
    );

    await optionSet.save({ validateBeforeSave: false });
    await optionSet.populate('items');

    res.status(201).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

export async function show(_req: Request, res: Response) {
  try {
    throw new NotFoundError('Metodo no permitido');
  } catch (error) {
    sendError(error, res);
  }
}

export async function update(_req: Request, res: Response) {
  try {
    throw new NotFoundError('Metodo no permitido');
  } catch (error) {
    sendError(error, res);
  }
}

export async function destroy(req: Request, res: Response) {
  const { setId } = req.params;
  try {
    const optionSet: HydratedDocument<IOptionSet> | null =
      await OptionSetModel.findByIdAndDelete(setId);

    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    const result = await OptionSetItemModel.deleteMany({ optionSet: setId });

    res.status(200).json({ ok: true, optionSet, itemsDeletes: result });
  } catch (error) {
    sendError(error, res);
  }
}
