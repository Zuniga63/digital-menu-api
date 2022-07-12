import { Schema, model, Types } from 'mongoose';
import { IImage } from '../utils/uitils';

export interface IOptionSetItem {
  optionSet: Types.ObjectId;
  name: string;
  image?: IImage;
  order: number;
  isEnabled: boolean;
}

const schema = new Schema<IOptionSetItem>(
  {
    optionSet: {
      type: Schema.Types.ObjectId,
      ref: 'OptionSet',
      required: [true, 'Se requiere un set de opciones.'],
    },
    name: {
      type: String,
      minlength: [3, 'Debe tener minimo 3 caracteres.'],
      maxlength: [45, 'Debe tener una maximo de 45 caracteres'],
      required: [true, 'El campo nombre es requerido.'],
    },
    image: Object,
    order: {
      type: Number,
      default: 0,
    },
    isEnabled: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  { timestamps: true }
);

export default model<IOptionSetItem>('OptionSetItem', schema);
