import { Schema, model, Types, Model, models } from 'mongoose';
import ProductModel from './Product.model';

export interface IOptionItem {
  _id?: Types.ObjectId;
  id?: string;
  optionSetItem: Types.ObjectId;
  price?: number;
  order: number;
  published: boolean;
}

export interface IProductOptionSet {
  _id?: Types.ObjectId;
  id?: string;
  product: Types.ObjectId;
  optionSet: Types.ObjectId;
  items: IOptionItem[];
  title: string;
  required: boolean;
  published: boolean;
  multiple: boolean;
  minCount?: number;
  maxCount?: number;
}

const optionItemSchema = new Schema<IOptionItem>(
  {
    optionSetItem: {
      type: Schema.Types.ObjectId,
      ref: 'OptionSetItem',
      required: [true, 'Se requiere seleccionar un item del set de opciones'],
    },
    price: Number,
    order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

type ProductOptionSetDocumentProps = {
  items: Types.DocumentArray<IOptionItem>;
};

type ProductOptionModelType = Model<IProductOptionSet, {}, ProductOptionSetDocumentProps>;

const schema = new Schema<IProductOptionSet, ProductOptionModelType>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Se requiere asignar un producto'],
    },
    optionSet: {
      type: Schema.Types.ObjectId,
      ref: 'OptionSet',
      required: [true, 'Se requiere asignar un set de opciones'],
    },
    items: [optionItemSchema],
    title: {
      type: String,
      minlength: [3, 'Debe tener minimo 3 caracteres.'],
      maxlength: [45, 'Debe tener una maximo de 45 caracteres'],
      required: [true, 'Se requiere un titulo para el set de opciones.'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    minCount: Number,
    maxCount: Number,
  },
  { timestamps: true }
);

schema.pre(['remove', 'deleteOne'], { document: true }, async function preDeleteOne() {
  const product = await ProductModel.findById(this.product);
  if (product) {
    product.optionSets = product.optionSets.filter((id) => !this._id.equals(id));

    await product.save({ validateBeforeSave: false });
  }
});

schema.pre('findOneAndDelete', async function preQuery() {
  const { _id } = this.getFilter();
  const productOptionSet = await models.ProductOptionSet.findById(_id);
  if (productOptionSet) {
    const product = await ProductModel.findById(productOptionSet.product);
    if (product) {
      product.optionSets = product.optionSets.filter((id) => !productOptionSet._id.equals(id));

      await product.save({ validateBeforeSave: false });
    }
  }
});

export default model<IProductOptionSet, ProductOptionModelType>('ProductOptionSet', schema);
