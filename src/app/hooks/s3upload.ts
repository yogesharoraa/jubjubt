// utils/s3Upload.ts
import { toast } from "react-toastify";

/**
 * Upload a single file to S3 using your backend signed URL API.
 * Returns the public URL without query parameters.
 * 
 * @param file File to upload
 * @param prefix S3 folder prefix (e.g., "reelboost/reels")
 * @param postData function to make API POST requests
 */
export const uploadFileToS3 = async (
  file: File,
  prefix: string,
  postData: (url: string, data: any, type?: string) => Promise<any>
): Promise<string | null> => {
  try {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
    const fileExtension = file.name.split(".").pop();
    const s3Key = `${prefix}/${timestamp}.${fileExtension}`;

    const formdataS3 = new FormData();
    formdataS3.append("mimetype", file.type);
    formdataS3.append("originalname", s3Key);

    // Get signed URL from backend
    const res = await postData("/social/upload-media-in-s3", formdataS3, "multipart/form-data");
    const s3Url = res?.data?.url;
    if (!s3Url) throw new Error("Invalid signed URL response");

    // Upload file to S3
    const uploadRes = await fetch(s3Url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!uploadRes.ok) throw new Error(`S3 upload failed with status ${uploadRes.status}`);

    // Return public URL (without query params)
    return s3Url.split("?")[0];
  } catch (err: any) {
    toast.error("S3 Upload Error: " + err.message);
    return null;
  }
};
