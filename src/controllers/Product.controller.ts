import { Request, Response } from 'express';
import { HydratedDocument, isValidObjectId } from 'mongoose';
import { destroyResource } from '../middlewares/formData';
import OptionSetModel, { IOptionSet } from '../models/OptionSet.model';
import OptionSetItemModel from '../models/OptionSetItem.model';
import ProductModel, { IProduct } from '../models/Product.model';
import ProductCategoryModel, {
  IProductCategory,
} from '../models/ProductCategory.model';
import ProductHasOptionSetModel from '../models/ProductHasOptionSet.model';
import ProductHasOptionSetItemModel from '../models/ProductHasOptionSetItem.model';
import NotFoundError from '../utils/errors/NotFoundError';
import ResponseInfo from '../utils/ResponseInfo';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

export async function index(_req: Request, res: Response) {
  try {
    const info = new ResponseInfo();
    const products = await ProductModel.find({})
      .sort('name')
      .populate('category', 'id name')
      .populate('optionSets', 'id title');

    info.products = products;
    info.ok = true;

    res.status(200).json(info);
  } catch (error) {
    sendError(error, res);
  }
}

export async function store(req: Request, res: Response) {
  const { categoryId } = req.body;
  const { optionSetIDs }: { optionSetIDs: string | undefined | string[] } =
    req.body;
  const info = new ResponseInfo();
  let category: HydratedDocument<IProductCategory> | null = null;

  try {
    const product: HydratedDocument<IProduct> = await ProductModel.create({
      ...req.body,
      category: categoryId,
      views: 0,
    });

    if (categoryId) {
      const isValid = isValidObjectId(categoryId);
      if (isValid) {
        category = await ProductCategoryModel.findById(categoryId);
        if (category) {
          category.products.push(product._id);
          await category.save({ validateBeforeSave: false });
          info.category = category;
        } else {
          info.addWarning('No se encontró la categoría en la base de datos.');
        }
      } else {
        info.addWarning('El ID de la categoría es invalido');
      }
    } else {
      info.addWarning('El producto no está asociado a una categoría');
    }

    if (optionSetIDs) {
      // se hace la conversión
      const setIDs: string[] = [];

      if (typeof optionSetIDs === 'string')
        setIDs.push(...JSON.parse(optionSetIDs));
      else setIDs.push(...optionSetIDs);

      await Promise.all(
        setIDs.map(async (id) => {
          const optionSet: HydratedDocument<IOptionSet> | null =
            await OptionSetModel.findById(id);

          if (optionSet) {
            const productOptionSet = await ProductHasOptionSetModel.create({
              product: product._id,
              optionSet: optionSet._id,
              title: optionSet.name,
            });

            product.optionSets.push(productOptionSet._id);

            await Promise.all(
              optionSet.items.map(async (itemId) => {
                const item = await OptionSetItemModel.findById(itemId);
                if (item) {
                  const productOptionItem =
                    await ProductHasOptionSetItemModel.create({
                      product: product._id,
                      optionSet: optionSet._id,
                      optionSetItem: item._id,
                      published: item.isEnabled,
                    });

                  product.optionSetItems.push(productOptionItem._id);
                  productOptionSet.items.push(productOptionItem._id);
                }
              })
            );

            await productOptionSet.save({ validateBeforeSave: false });
          }
        })
      );

      await product.save({ validateBeforeSave: false });
    }

    info.ok = true;
    info.message = 'Producto registrado con exito.';
    info.product = product;

    res.status(200).json(info);
  } catch (error) {
    // Delete image if store failed.
    const { image }: { image: IImage } = req.body;
    if (image) {
      await destroyResource(image.publicId);
    }

    sendError(error, res);
  }
}

export async function show(req: Request, res: Response) {
  const { productId } = req.params;
  const info = new ResponseInfo();
  try {
    const product: HydratedDocument<IProduct> | null =
      await ProductModel.findById(productId)
        .select('-optionSetItems')
        .populate('category', 'id name image')
        .populate({
          path: 'optionSets',
          populate: {
            path: 'items',
            populate: 'optionSetItem',
          },
        });
    if (!product) throw new NotFoundError('Producto no encontrado.');

    info.product = product;
    info.ok = true;

    res.status(200).json(info);
  } catch (error) {
    sendError(error, res);
  }
}

export async function update(_req: Request, res: Response) {
  try {
    res.status(405).send();
  } catch (error) {
    sendError(error, res);
  }
}

export async function destroy(req: Request, res: Response) {
  const { productId } = req.params;
  const info = new ResponseInfo();
  try {
    const product = await ProductModel.findByIdAndDelete(productId);
    if (!product) throw new NotFoundError('Producto no encontrado.');

    if (product && product.image && product.image.publicId) {
      await destroyResource(product.image.publicId);
    }

    // Delete options sets
    if (product?.optionSets.length) {
      await ProductHasOptionSetModel.deleteMany({ product: product._id });
    }

    // Delete option Items
    if (product?.optionSetItems.length) {
      await ProductHasOptionSetItemModel.deleteMany({ product: product._id });
    }

    // Delete in category
    if (product.category) {
      const category = await ProductCategoryModel.findById(product.category);
      if (category) {
        category.products = category.products.filter(
          (id) => !id.equals(product._id)
        );

        await category.save({ validateBeforeSave: false });
      }
    }

    info.ok = true;
    info.product = product;

    res.status(200).json(info);
  } catch (error) {
    sendError(error, res);
  }
}

export async function updateImage(_req: Request, res: Response) {
  try {
    res.status(405).send();
  } catch (error) {
    sendError(error, res);
  }
}

export async function removeImage(_req: Request, res: Response) {
  try {
    res.status(405).send();
  } catch (error) {
    sendError(error, res);
  }
}
