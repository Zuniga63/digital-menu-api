import { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import { destroyResource } from '../middlewares/formData';
import OptionSetModel, { IOptionSet } from '../models/OptionSet.model';
import OptionSetItemModel, {
  IOptionSetItem,
} from '../models/OptionSetItem.model';
import NotFoundError from '../utils/errors/NotFoundError';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

//-----------------------------------------------------------------------------
// INTERFACE
//-----------------------------------------------------------------------------

interface IStoreItem {
  name: string;
  image?: IImage;
  isEnabled?: boolean | string;
}

interface IStoreSet {
  name: string;
  isEnabled?: boolean;
  items: IStoreItem[];
}

interface ItemError {
  name: string;
  index: number;
  message: string;
  validations?: {};
}

//-----------------------------------------------------------------------------
// CRUD OF OPTION SETS
//-----------------------------------------------------------------------------
export async function list(_req: Request, res: Response) {
  try {
    const optionSets = await OptionSetModel.find({}).populate({
      path: 'items',
      options: {
        sort: { order: 1 },
      },
    });
    res.status(200).json({ ok: true, optionSets });
  } catch (error) {
    sendError(error, res);
  }
}

export async function store(req: Request, res: Response) {
  const { name, isEnabled, items }: IStoreSet = req.body;

  let optionSet: HydratedDocument<IOptionSet> | null = null;
  const optionItems: HydratedDocument<IOptionSetItem>[] = [];
  const itemErrors: ItemError[] = [];

  // Se valida si vienen items en la petición
  if (typeof items !== 'object' || items.length <= 0) {
    throw new Error('El set de opciones no puede estár vacío.');
  }

  try {
    // Se crea el set de opciones
    optionSet = await OptionSetModel.create({ name, isEnabled });

    // Se crean lo items del set
    await Promise.all(
      items.map(async (item, index) => {
        try {
          const optionSetItem = await OptionSetItemModel.create({
            optionSet: optionSet?._id,
            name: item.name,
            order: index + 1,
            isEnabled: item.isEnabled,
          });

          optionSet?.items.push(optionSetItem._id);
          optionItems.push(optionSetItem);
        } catch (error: any) {
          const itemError: ItemError = {
            name: item.name,
            index,
            message: error.message,
          };
          if (error.name === 'ValidationError') {
            itemError.validations = error.errors;
          }

          itemErrors.push(itemError);
        }
      })
    );

    if (itemErrors.length) {
      if (optionSet) optionSet.deleteOne();
      res.status(400).json({ ok: false, itemErrors });
    } else {
      await optionSet.save({ validateBeforeSave: false });
      await optionSet.populate('items');

      res.status(201).json({ ok: true, optionSet });
    }
  } catch (error: any) {
    if (optionSet) optionSet.deleteOne();
    // res.status(400).json(error);
    sendError(error, res);
  }
}

export async function show(req: Request, res: Response) {
  const { setId } = req.params;
  try {
    const optionSet = await OptionSetModel.findById(setId).populate({
      path: 'items',
      options: {
        sort: { order: 1 },
      },
    });
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');
    res.status(200).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

export async function updateOptionSetName(req: Request, res: Response) {
  const { name }: { name: string } = req.body;
  const { setId } = req.params;

  try {
    const optionSet = await OptionSetModel.findById(setId);
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    if (optionSet.name !== name) {
      optionSet.name = name;
      await optionSet.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

export async function enabledOptionSet(req: Request, res: Response) {
  const { setId } = req.params;

  try {
    const optionSet = await OptionSetModel.findById(setId);
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    if (!optionSet.isEnabled) {
      optionSet.isEnabled = true;
      await optionSet.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

export async function disabledOptionSet(req: Request, res: Response) {
  const { setId } = req.params;

  try {
    const optionSet = await OptionSetModel.findById(setId);
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    if (optionSet.isEnabled) {
      optionSet.isEnabled = false;
      await optionSet.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

export async function sortItems(req: Request, res: Response) {
  const { setId } = req.params;
  const { ids }: { ids: string[] } = req.body;

  try {
    await Promise.all(
      ids.map(async (id, index) => {
        await OptionSetItemModel.updateOne(
          { optionSet: setId, _id: id },
          { order: index + 1 }
        );
      })
    );

    res.status(200).json({ ok: true });
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
    res.status(200).json({ ok: true, optionSet });
  } catch (error) {
    sendError(error, res);
  }
}

//-----------------------------------------------------------------------------
// CRUD OF OPTION SET ITEM
//-----------------------------------------------------------------------------

export async function listOptionItems(req: Request, res: Response) {
  const { setId } = req.params;
  try {
    const optionItems = await OptionSetItemModel.find({
      optionSet: setId,
    }).sort({ order: 1 });
    res.status(200).json({ ok: true, optionItems });
  } catch (error) {
    sendError(error, res);
  }
}

export async function addItem(req: Request, res: Response) {
  const { setId } = req.params;
  const { name, image, isEnabled }: IStoreItem = req.body;

  try {
    const optionSet = await OptionSetModel.findById(setId);
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    const optionItem = await OptionSetItemModel.create({
      optionSet: optionSet._id,
      name,
      image,
      isEnabled: isEnabled ? isEnabled === 'true' : false,
      order: optionSet.items.length + 1,
    });

    optionSet.items.push(optionItem._id);
    await optionSet.save({ validateBeforeSave: false });

    res.status(201).json({ ok: true, optionItem });
  } catch (error) {
    if (image) {
      await destroyResource(image.publicId);
    }
    sendError(error, res);
  }
}

export async function updateOptionSetItem(req: Request, res: Response) {
  const { itemId } = req.params;
  const { name, image, isEnabled }: IStoreItem = req.body;
  let lastImage: IImage | undefined;

  try {
    const optionItem = await OptionSetItemModel.findById(itemId);

    if (!optionItem)
      throw new NotFoundError('El item no existe o fue eliminado.');

    lastImage = optionItem.image;

    if (name && name !== optionItem.name) optionItem.name = name;
    if (image) optionItem.image = image;
    optionItem.isEnabled = isEnabled ? isEnabled === 'true' : false;

    await optionItem.save({ validateModifiedOnly: true });
    if (image && lastImage) {
      destroyResource(lastImage.publicId);
    }

    res.status(200).json({ ok: true, optionItem });
  } catch (error) {
    if (image) {
      await destroyResource(image.publicId);
    }
    sendError(error, res);
  }
}

export async function enabledOptionSetItem(req: Request, res: Response) {
  const { itemId } = req.params;
  try {
    const optionItem = await OptionSetItemModel.findById(itemId);
    if (!optionItem)
      throw new NotFoundError('El item no existe o fue eliminado.');

    if (!optionItem.isEnabled) {
      optionItem.isEnabled = true;
      await optionItem.save({ validateBeforeSave: false });
    }

    res.json({ ok: true, optionItem });
  } catch (error) {
    sendError(error, res);
  }
}

export async function disabledOptionSetItem(req: Request, res: Response) {
  const { itemId } = req.params;
  try {
    const optionItem = await OptionSetItemModel.findById(itemId);
    if (!optionItem)
      throw new NotFoundError('El item no existe o fue eliminado.');

    if (optionItem.isEnabled) {
      optionItem.isEnabled = false;
      await optionItem.save({ validateBeforeSave: false });
    }

    res.json({ ok: true, optionItem });
  } catch (error) {
    sendError(error, res);
  }
}

export async function removeImageOfOptionSetItem(req: Request, res: Response) {
  const { itemId } = req.params;

  try {
    const optionItem = await OptionSetItemModel.findById(itemId);
    if (!optionItem)
      throw new NotFoundError('El item no existe o fue eliminado.');

    if (optionItem.image) {
      await destroyResource(optionItem.image.publicId);
      optionItem.image = undefined;
      await optionItem.save({ validateBeforeSave: false });
    }

    res.json({ ok: true, optionItem });
  } catch (error) {
    sendError(error, res);
  }
}

export async function destroyOptionSetItem(req: Request, res: Response) {
  const { setId, itemId } = req.params;

  try {
    const optionSet = await OptionSetModel.findById(setId);
    if (!optionSet) throw new NotFoundError('Set de opciones no encontrado.');

    // Se elimina el item y sus recursos
    const optionItem = await OptionSetItemModel.findByIdAndDelete(itemId);
    if (!optionItem)
      throw new NotFoundError('El item no existe o fue eliminado.');

    if (optionItem.image) {
      destroyResource(optionItem.image.publicId);
    }

    // Se actualiza el set de opciones
    optionSet.items = optionSet.items.filter(
      (id) => !optionItem._id.equals(id)
    );
    await optionSet.save({ validateBeforeSave: false });

    // Se actualiza el orden de los demas items
    await OptionSetItemModel.updateMany(
      { optionSet: optionSet._id },
      { $inc: { order: -1 } }
    )
      .where('order')
      .gt(optionItem.order);

    res.status(200).json({ ok: true, optionItem });
  } catch (error) {
    sendError(error, res);
  }
}
