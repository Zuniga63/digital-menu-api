/* eslint-disable no-console */
import { v2 as cloudinary } from 'cloudinary';

export default async function createCategoryPreset(): Promise<void> {
  try {
    const preset = await cloudinary.api.create_upload_preset({
      name: 'category_preset',
      folder: 'digital-menu/categories',
      resource_type: 'image',
      allowed_formats: 'jpg, png, gif, webp, bmp, jpe, jpeg',
      access_mode: 'public',
      unique_filename: true,
      auto_tagging: 0.7,
      overwrite: true,

      transformation: [
        {
          width: 200,
          height: 200,
          crop: 'thumb',
        },
      ],
    });

    console.log(preset);
  } catch (error: any) {
    console.error(error.error.message);
  }
}
