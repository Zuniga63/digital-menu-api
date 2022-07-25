/* eslint-disable no-console */
import { v2 as cloudinary } from 'cloudinary';

export default async function createProductPreset(): Promise<void> {
  try {
    const preset = await cloudinary.api.create_upload_preset({
      name: 'product_preset',
      folder: 'digital-menu/products',
      resource_type: 'image',
      allowed_formats: 'jpg, png, gif, webp, bmp, jpe, jpeg',
      access_mode: 'public',
      unique_filename: true,
      auto_tagging: 0.7,
      overwrite: true,

      transformation: [{ width: 480, crop: 'scale' }, { dpr: 'auto' }],
    });

    console.log(preset);
  } catch (error: any) {
    console.error(error.error.message);
  }
}
