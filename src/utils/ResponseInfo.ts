import { IProduct } from '../models/Product.model';
import { IProductCategory } from '../models/ProductCategory.model';

export default class ResponseInfo {
  ok: boolean;

  message?: string;

  error?: any;

  validationErrors?: object;

  warnings: string[];

  product?: IProduct;

  products?: IProduct[];

  category?: IProductCategory;

  constructor(message?: string) {
    this.ok = false;
    this.message = message;
    this.warnings = [];
  }

  addWarning(message: string) {
    this.warnings.push(message);
  }
}
