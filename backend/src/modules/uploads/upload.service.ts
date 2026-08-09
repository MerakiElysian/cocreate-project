import sharp from "sharp";
import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/apiError";

export const uploadService = {
  async optimizeAndUpload(
    fileBuffer: Buffer,
    folder: "avatars" | "projects" | "misc" = "misc"
  ) {
    if (!fileBuffer?.length) {
      throw ApiError.badRequest("No file provided");
    }

    // Optimize with Sharp: resize (max 1600px wide), convert to webp, compress
    const optimizedBuffer = await sharp(fileBuffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `cocreate/${folder}`, resource_type: "image" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(optimizedBuffer);
      }
    );

    return uploadResult;
  },

  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  },
};
