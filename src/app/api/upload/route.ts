import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  endpoint: process.env.CLOUDFLARE_URL, // Base URL of your R2 storage
  region: "auto", // Cloudflare R2 uses "auto" for region
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME, // Name of your R2 bucket
      Key: fileName, // File name (key) in the bucket
      ContentType: fileType, // MIME type of the file
    });

    // Generate a signed URL for uploading the file
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `${process.env.CLOUDFLARE_URL}/${process.env.R2_BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
