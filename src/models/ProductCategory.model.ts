import { Schema, model, Types, models, Model } from 'mongoose';
import { IImage } from '../utils/uitils';

export interface IProductCategory {
  id?: string;
  name: string;
  description?: string;
  image?: IImage;
  order: number;
  products: Types.ObjectId[];
  isEnabled: boolean;
}

const schema = new Schema<IProductCategory, Model<IProductCategory>>(
  {
    name: {
      type: String,
      minlength: [3, 'Debe tener minimo 3 caracteres.'],
      maxlength: [45, 'Debe tener una maximo de 45 caracteres'],
      required: [true, 'El campo nombre es requerido.'],
      validate: [
        {
          async validator(value: string) {
            try {
              const category = await models.ProductCategory.findOne({
                name: value,
              });
              return !category;
            } catch (error) {
              return false;
            }
          },
          message: 'Ya existe una categoría con este nombre.',
        },
      ],
    },
    description: {
      type: String,
      maxlength: [255, 'Debe tener una maximo de 255 caracteres'],
    },
    image: Object,
    order: {
      type: Number,
      default: 0,
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model<IProductCategory>('ProductCategory', schema);
