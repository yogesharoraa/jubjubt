const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});

async function uploadFileToS3(localFilePath, folder = "reels") {
    try {
        const fileStream = fs.createReadStream(localFilePath);
        const fileName = path.basename(localFilePath);

        const Key = `${folder}/${Date.now()}_${fileName}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key,
            Body: fileStream,
        };

        await client.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${Key}`;

        return fileUrl;

    } catch (error) {
        console.error("❌ S3 Upload Error:", error);
        throw error;
    }
}

module.exports = { uploadFileToS3 };
