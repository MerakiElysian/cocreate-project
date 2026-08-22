import sharp from "sharp";
import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/apiError";
import { logger } from "../../utils/logger";

export const uploadService = {
  async optimizeAndUpload(
    fileBuffer: Buffer,
    folder: "avatars" | "projects" | "misc" = "misc"
  ) {
    if (!fileBuffer?.length) {
      throw ApiError.badRequest("No file provided");
    }

    // Optimize with Sharp: resize (max 800px wide for avatars, 1600px for projects), convert to webp, compress
    const maxDim = folder === "avatars" ? 600 : 1600;
    const optimizedBuffer = await sharp(fileBuffer)
      .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    try {
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
    } catch (err) {
      logger.warn(`Cloudinary upload failed or not configured, using inline optimized image: ${(err as Error).message}`);
      const base64Data = optimizedBuffer.toString("base64");
      const dataUri = `data:image/webp;base64,${base64Data}`;
      return {
        secure_url: dataUri,
        public_id: `inline_${Date.now()}`,
      };
    }
  },

  async deleteImage(publicId: string) {
    if (!publicId.startsWith("inline_")) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
  },
};

