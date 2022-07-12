import { Schema, model, Types, models } from 'mongoose';
import { createSlug, IImage } from '../utils/uitils';

export interface IProduct {
  id?: string;
  category?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: IImage;
  price: number;
  hasDiscount: boolean;
  priceWithDiscount?: number;
  isNew: boolean;
  hasVariant: boolean;
  variantTitle?: string;
  published: boolean;
  views: number;
}

const schema = new Schema<IProduct>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
      validate: [
        {
          async validator(value: Schema.Types.ObjectId) {
            try {
              const category = await models.ProductCategory.findById(value);
              return !!category;
            } catch (error) {
              return false;
            }
          },
          message: 'La categoría seleccionada no está registrada.',
        },
      ],
    },
    name: {
      type: String,
      minlength: [3, 'Debe tener minimo 3 caracteres.'],
      maxlength: [45, 'Debe tener una maximo de 45 caracteres'],
      required: [true, 'El campo nombre es requerido.'],
      validate: [
        {
          async validator(value: string) {
            try {
              const product = await models.Product.findOne({
                name: value,
              });
              return !product;
            } catch (error) {
              return false;
            }
          },
          message: 'Ya existe un producto con este nombre.',
        },
      ],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      maxlength: [255, 'Debe tener una maximo de 255 caracteres'],
    },
    image: Object,
    price: {
      type: Number,
      min: 100,
      required: true,
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
    priceWithDiscount: Number,
    isNew: {
      type: Boolean,
      default: false,
    },
    hasVariant: {
      type: Boolean,
      default: false,
    },
    variantTitle: {
      type: String,
      minlength: [3, 'Debe tener minimo 3 caracteres.'],
      maxlength: [45, 'Debe tener una maximo de 45 caracteres'],
    },
    published: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      defualt: 0,
    },
  },
  { timestamps: true }
);

schema.pre('save', function preSave(next) {
  const product = this;

  if (this.isModified('name') || this.isNew) {
    product.slug = createSlug(product.name);
  }

  next();
});

export default model<IProduct>('Product', schema);
