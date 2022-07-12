import { Request, Response } from 'express';
import { HydratedDocument, isValidObjectId } from 'mongoose';
import { destroyResource } from '../middlewares/formData';
import ProductModel, { IProduct } from '../models/Product.model';
import ProductCategoryModel, {
  IProductCategory,
} from '../models/ProductCategory.model';
import NotFoundError from '../utils/errors/NotFoundError';
import ResponseInfo from '../utils/ResponseInfo';
import sendError from '../utils/sendError';
import { IImage } from '../utils/uitils';

export async function index(_req: Request, res: Response) {
  try {
    const info = new ResponseInfo();
    const products = await ProductModel.find({})
      .sort('name')
      .populate('category', 'id name');

    info.products = products;
    info.ok = true;

    res.status(200).json(info);
  } catch (error) {
    sendError(error, res);
  }
}

export async function store(req: Request, res: Response) {
  const { categoryId } = req.body;
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
      await ProductModel.findById(productId).populate(
        'category',
        'id name image'
      );
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
