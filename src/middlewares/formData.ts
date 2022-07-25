import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import busboy from 'busboy';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { createSlug, IImage } from '../utils/uitils';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRESETS = {
  profilePhoto: 'user_profile_preset',
  category: 'category_preset',
  product: 'product_preset',
  optionsItem: 'option_item_preset',
};

export const destroyResource = async (publicId?: string) => {
  try {
    if (publicId) {
      const cloudRes = await cloudinary.uploader.destroy(publicId);
      return cloudRes;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return { result: 'failed' };
};

const formData = (req: Request, _res: Response, next: NextFunction) => {
  const body: { [key: string]: any } = {};
  const bb = busboy({ headers: req.headers });
  const { originalUrl } = req;

  // vars for controller the upload of files
  let uploadingFile = false;
  let uploadingCount = 0;

  /**
   * Method in charge of exiting the middleware when
   * all the files and properties has been loaded.
   */
  const done = (): void => {
    if (uploadingFile) return;
    if (uploadingCount > 0) return;

    req.body = body;
    next();
  };

  bb.on('field', (key, value) => {
    body[key] = value;
  });

  bb.on('file', (key, file, info) => {
    let preset: string = 'ml_default';

    /**
     * mimeType es un string de la forma image/jpg - image/gif - video/mp4
     */
    const { mimeType } = info;
    const [fileType] = mimeType.split('/');
    const options: UploadApiOptions = {};

    uploadingFile = true;
    uploadingCount += 1;

    // console.log(originalUrl);
    if (originalUrl.includes('users')) preset = PRESETS.profilePhoto;
    else if (originalUrl.includes('categories')) preset = PRESETS.category;
    else if (originalUrl.includes('products')) preset = PRESETS.product;
    else if (originalUrl.includes('option-sets')) preset = PRESETS.optionsItem;

    options.upload_preset = preset;
    options.resource_type = fileType;
    if (body.name) {
      const name = createSlug(body.name);
      const id = nanoid(10);

      options.public_id = `${name}-${id}`;
      // options.public_id = `${name}`;
    }

    const cloud = cloudinary.uploader.upload_stream(
      options,
      (cloudErr, cloudRes) => {
        if (cloudErr) {
          next(cloudErr);
        }

        if (cloudRes) {
          const {
            public_id: publicId,
            width,
            height,
            format,
            resource_type: type,
            secure_url: url,
          } = cloudRes;
          body[key] = { publicId, width, height, format, type, url } as IImage;
        }

        uploadingFile = false;
        uploadingCount -= 1;
        done();
      }
    );

    file.on('data', (data) => {
      cloud.write(data);
    });

    file.on('end', () => {
      cloud.end();
    });
  });

  bb.on('finish', () => {
    done();
  });

  req.pipe(bb);
};

export default formData;
