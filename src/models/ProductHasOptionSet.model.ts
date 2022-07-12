import { Schema, model, Types } from 'mongoose';

export interface IProductHasOptionSet {
  product: Types.ObjectId;
  optionSet: Types.ObjectId;
  title: string;
  required: boolean;
  multiple: boolean;
  minCount?: number;
  maxCount?: number;
}

const schema = new Schema<IProductHasOptionSet>(
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
    multiple: {
      type: Boolean,
      default: false,
    },
    minCount: Number,
    maxCount: Number,
  },
  { timestamps: true }
);

export default model<IProductHasOptionSet>('ProductHasOptionSet', schema);
