import { Schema, model, Types } from 'mongoose';

export interface IProductHasOptionSetItem {
  product: Types.ObjectId;
  optionSet: Types.ObjectId;
  optionSetItem: Types.ObjectId;
  price?: number;
  order: number;
  published: boolean;
}

const schema = new Schema<IProductHasOptionSetItem>(
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

export default model<IProductHasOptionSetItem>(
  'ProductHasOptionSetItem',
  schema
);
