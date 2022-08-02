import { Request, Response } from 'express';
import { destroyResource } from '../middlewares/formData';
import ProductModel from '../models/Product.model';
import ProductCategoryModel, { IProductCategory } from '../models/ProductCategory.model';
import NotFoundError from '../utils/errors/NotFoundError';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

interface IStore {
  name: string;
  description?: string;
  image?: IImage;
  order?: number;
  isEnabled?: string;
}

/**
 * This method recover all categories of DB
 * @param _req
 * @param res
 */
export async function list(_req: Request, res: Response) {
  try {
    const categories = await ProductCategoryModel.find({}).sort('order');
    res.status(200).json({ ok: true, categories });
  } catch (error) {
    sendError(error, res);
  }
}

export async function home(_req: Request, res: Response) {
  try {
    const categories = await ProductCategoryModel.find({})
      .sort('order')
      .populate({
        path: 'products',
        populate: {
          path: 'optionSets',
          populate: 'items.optionSetItem',
        },
        options: {
          sort: { views: 1 },
        },
      });
    res.status(200).json({ ok: true, categories });
  } catch (error) {
    sendError(error, res);
  }
}

/**
 * This method recover one category of products.
 * @param req
 * @param res
 */
export async function show(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;

    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    res.status(200).json({ ok: true, category });
  } catch (error) {
    sendError(error, res);
  }
}

/**
 * This method store a product category in DB
 * @param req
 * @param res
 */
export async function store(req: Request, res: Response) {
  try {
    const { name, description, image }: IStore = req.body;
    const count = await ProductCategoryModel.count();

    const category: IProductCategory = await ProductCategoryModel.create({
      name,
      description,
      image,
      order: count + 1,
    });

    res.status(201).json({ ok: true, category });
  } catch (error) {
    // Delete image if store failed.
    const { image }: { image: IImage } = req.body;
    if (image) {
      await destroyResource(image.publicId);
    }

    sendError(error, res);
  }
}

/**
 * This method update all properties of categories.
 * ! The order no change.
 * @param req
 * @param res
 */
export async function update(req: Request, res: Response) {
  try {
    const { name, description, image, isEnabled }: IStore = req.body;
    const { categoryId } = req.params;

    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    // Save the last image before update
    const lastImage: IImage | undefined = category.image;

    // update sensible informatión
    if (category.name !== name) category.name = name; // name must be unique
    if (image) category.image = image;

    // update rest
    category.description = description;
    category.isEnabled = isEnabled ? isEnabled === 'true' : false;

    await category.save({ validateModifiedOnly: true });

    // delete last image of cloud
    if (image && lastImage) {
      await destroyResource(lastImage.publicId);
    }

    res.status(200).json({ ok: true, category });
  } catch (error) {
    const { image }: { image: IImage } = req.body;
    if (image) {
      await destroyResource(image.publicId);
    }
    sendError(error, res);
  }
}

/**
 * This method delete a category of DB and delete image if exist.
 * also update the order of up categories.
 * @param req
 * @param res
 */
export async function destroy(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;

    const category = await ProductCategoryModel.findByIdAndDelete(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    // delete image
    if (category.image) await destroyResource(category.image.publicId);

    // updtae the order of rest categories
    await ProductCategoryModel.where('order')
      .gte(category.order)
      .updateMany({}, { $inc: { order: -1 } });

    // Set undefined in products
    await ProductModel.updateMany({ category: category._id }, { category: undefined });

    res.status(200).json({ ok: true });
  } catch (error) {
    sendError(error, res);
  }
}

/**
 * This method update the image of category and delete the last image.
 * @param req
 * @param res
 */
export async function updateImage(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;
    const { image }: IStore = req.body;

    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    if (image) {
      const lastImage: IImage | undefined = category.image;
      category.image = image;
      await category.save({ validateBeforeSave: false });
      if (lastImage) {
        await destroyResource(lastImage.publicId);
      }

      res.status(200).json({ ok: true, category });
    } else {
      res.status(400).json({ ok: false, message: 'No se pudo actualizar la imagen' });
    }
  } catch (error) {
    const { image }: { image: IImage } = req.body;
    if (image) {
      await destroyResource(image.publicId);
    }
    sendError(error, res);
  }
}

/**
 * This method remove the category image of cloudinary and update.
 * @param req
 * @param res
 */
export async function deleteImage(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;

    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada');

    if (category.image) {
      await destroyResource(category.image.publicId);

      category.image = undefined;
      await category.save({ validateBeforeSave: false });

      res.status(200).json({ ok: true, category });
    } else {
      res.status(400).json({ ok: false, message: 'La categoría no tiene imagen.' });
    }
  } catch (error) {
    sendError(error, res);
  }
}

export async function destroyAll(_req: Request, res: Response) {
  const categories = await ProductCategoryModel.find({});
  await Promise.all(
    categories.map((item) => {
      if (item.image && item.image.publicId) {
        return destroyResource(item.image.publicId);
      }
      return null;
    })
  );

  const result = await ProductCategoryModel.deleteMany({});

  res.status(200).json({ result });
}

export async function disabledCategory(req: Request, res: Response) {
  const { categoryId } = req.params;

  try {
    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada.');

    category.isEnabled = false;
    await category.save({ validateBeforeSave: false });

    res.status(200).json({ ok: true });
  } catch (error) {
    sendError(error, res);
  }
}

export async function enabledCategory(req: Request, res: Response) {
  const { categoryId } = req.params;

  try {
    const category = await ProductCategoryModel.findById(categoryId);
    if (!category) throw new NotFoundError('Categoría no encontrada.');

    category.isEnabled = true;
    await category.save({ validateBeforeSave: false });

    res.status(200).json({ ok: true });
  } catch (error) {
    sendError(error, res);
  }
}
