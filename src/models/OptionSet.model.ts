import { Schema, model, Types, models } from 'mongoose';

export interface IOptionSet {
  id?: string;
  name: string;
  items: Types.ObjectId[];
  isEnabled: boolean;
}

const schema = new Schema<IOptionSet>(
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
              const document = await models.OptionSet.findOne({
                name: value,
              });
              return !document;
            } catch (error) {
              return false;
            }
          },
          message: 'Ya existe un set de opciones con este nombre.',
        },
      ],
    },
    isEnabled: {
      type: Boolean,
      default: true,
      required: false,
    },
    items: [{ type: Schema.Types.ObjectId, ref: 'OptionSetItem' }],
  },
  { timestamps: true }
);

export default model<IOptionSet>('OptionSet', schema);
