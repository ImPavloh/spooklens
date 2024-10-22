import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// se podría separar a la API
export const getCloudinarySignature = async (): Promise<{ timestamp: number; signature: string }> => {
  const timestamp: number = Math.round(new Date().getTime() / 1000);

  const signature: string = cloudinary.utils.api_sign_request(
    {
      timestamp,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
    },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return { timestamp, signature };
};

export default cloudinary;