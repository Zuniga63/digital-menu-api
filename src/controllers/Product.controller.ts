import { Request, Response } from 'express';
import { HydratedDocument, isValidObjectId } from 'mongoose';
import { destroyResource } from '../middlewares/formData';

import ProductModel, { IProduct } from '../models/Product.model';
import ProductOptionSetModel, {
  IOptionItem,
} from '../models/ProductOptionSet.model';
import OptionSetModel, { IOptionSet } from '../models/OptionSet.model';
import OptionSetItemModel from '../models/OptionSetItem.model';
import ProductCategoryModel, {
  IProductCategory,
} from '../models/ProductCategory.model';

import NotFoundError from '../utils/errors/NotFoundError';
import ResponseInfo from '../utils/ResponseInfo';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

interface ProductUpdate {
  categoryId: string;
  name: string;
  description?: string;
  image?: IImage;
  price: number;
  hasDiscount?: string;
  priceWithDiscount?: number;
  productIsNew?: string;
  hasVariant?: string;
  variantTitle?: string;
  published?: string;
}

export async function index(_req: Request, res: Response) {
  try {
    const info = new ResponseInfo();
    const products = await ProductModel.find({})
      .sort('name')
      .populate('category', 'id name')
      .populate({
        path: 'optionSets',
        populate: {
          path: 'items',
          populate: 'optionSetItem',
        },
      });

    info.products = products;
    info.ok = true;

    res.status(200).json(info);
  } catch (error) {
    sendError(error, res);
  }
}

export async function store(req: Request, res: Response) {
  const { categoryId, optionSetIDs } = req.body;

  const info = new ResponseInfo();
  let category: HydratedDocument<IProductCategory> | null = null;

  try {
    // Se crea el producto
    const product: HydratedDocument<IProduct> = await ProductModel.create({
      ...req.body,
      category: categoryId,
      optionSets: [],
      views: 0,
    });

    // Se busca la categoría y se agrega el producto
    if (categoryId) {
      if (isValidObjectId(categoryId)) {
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

    // Se agregan los sets de opciones
    if (optionSetIDs && typeof optionSetIDs === 'string') {
      // se hace la conversión
      const setIDs: string[] = [];

      try {
        setIDs.push(...JSON.parse(optionSetIDs));

        await Promise.all(
          setIDs.map(async (setId) => {
            const optionSet: HydratedDocument<IOptionSet> | null =
              await OptionSetModel.findById(setId);

            if (optionSet) {
              const optionItems: IOptionItem[] = [];

              await Promise.all(
                optionSet.items.map(async (itemId) => {
                  const item = await OptionSetItemModel.findById(itemId);
                  if (item) {
                    optionItems.push({
                      optionSetItem: item._id,
                      order: item.order,
                      published: item.isEnabled,
                    });
                  }
                })
              );

              const productOptionSet = await ProductOptionSetModel.create({
                product: product._id,
                optionSet: optionSet._id,
                title: optionSet.name,
                items: optionItems,
                published: optionSet.isEnabled,
              });

              product.optionSets.push(productOptionSet._id);

              await productOptionSet.save({ validateBeforeSave: false });
            }
          })
        );

        await product.save({ validateBeforeSave: false });
      } catch (error) {
        info.warnings.push('No se pudo agregar el set de opciones');
      }
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
  const { slug } = req.params;
  const info = new ResponseInfo();
  try {
    const product: HydratedDocument<IProduct> | null =
      await ProductModel.findOne({ slug })
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

export async function update(req: Request, res: Response) {
  const {
    categoryId,
    name,
    description,
    image,
    price,
    hasDiscount,
    priceWithDiscount,
    productIsNew,
    hasVariant,
    variantTitle,
    published,
  }: ProductUpdate = req.body;

  const { productId } = req.params;

  try {
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado.');

    product.description = description;
    product.price = price;
    product.productIsNew = productIsNew ? productIsNew === 'true' : false;
    product.published = published ? published === 'true' : false;
    if (name && product.name !== name) product.name = name;

    const lastImage = product.image;
    if (image) product.image = image;

    if (hasDiscount && hasDiscount === 'true') {
      product.hasDiscount = true;
      product.priceWithDiscount = priceWithDiscount;
    } else {
      product.hasDiscount = false;
      product.priceWithDiscount = undefined;
    }

    if (hasVariant && hasVariant === 'true') {
      product.hasVariant = true;
      product.variantTitle = variantTitle;
    } else {
      product.hasVariant = false;
      product.variantTitle = undefined;
    }

    if (!product.category?.equals(categoryId)) {
      const oldCategory = await ProductCategoryModel.findById(product.category);
      if (oldCategory) {
        // Se retira el producto de la categoría
        oldCategory.products = oldCategory.products.filter(
          (id) => !product._id.equals(id)
        );
        await oldCategory.save({ validateBeforeSave: false });
      }

      if (categoryId) {
        const newCategory = await ProductCategoryModel.findById(categoryId);
        if (newCategory) {
          newCategory.products.push(product._id);
          await newCategory.save({ validateBeforeSave: false });
          product.category = newCategory._id;
        }
      } else {
        product.category = undefined;
      }
    }

    product.save({ validateModifiedOnly: true });
    if (image && lastImage) await destroyResource(lastImage.publicId);

    res.status(200).json({ ok: true, product });
  } catch (error) {
    if (image) {
      await destroyResource(image.publicId);
    }
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
      await ProductOptionSetModel.deleteMany({ product: product._id });
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

export async function updateImage(req: Request, res: Response) {
  const { image }: { image: IImage } = req.body;
  const { productId } = req.params;

  try {
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado.');

    if (image) {
      const lastImage = product.image;
      product.image = image;
      await product.save({ validateBeforeSave: false });
      if (lastImage) {
        await destroyResource(lastImage.publicId);
      }
    }

    res.status(200).json({ ok: true, product });
  } catch (error) {
    sendError(error, res);
  }
}

export async function removeImage(req: Request, res: Response) {
  const { productId } = req.params;
  try {
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado.');

    if (product.image) {
      await destroyResource(product.image.publicId);
      product.image = undefined;
      await product.save({ validateBeforeSave: false });
    }
    res.status(200).json({ ok: true, product });
  } catch (error) {
    sendError(error, res);
  }
}

export async function addView(req: Request, res: Response) {
  const { productId } = req.params;

  try {
    const product = await ProductModel.findById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado.');

    product.views += 1;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({ ok: true });
  } catch (error) {
    sendError(error, res);
  }
}
