import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const getEnv = (key: string) => {
  return (
    import.meta.env[`VITE_${key}`] ||
    import.meta.env[`NEXT_PUBLIC_${key}`] ||
    import.meta.env[key] ||
    ""
  );
};

const keyId = getEnv("B2_KEY_ID");
const applicationKey = getEnv("B2_APPLICATION_KEY");
const endpoint = getEnv("B2_ENDPOINT");
const bucketName = getEnv("B2_BUCKET_NAME");
const region = getEnv("B2_REGION") || "eu-central-003";

// Ensure endpoint has protocol
const s3Endpoint = endpoint ? (endpoint.startsWith("http") ? endpoint : `https://${endpoint}`) : undefined;

let s3Client: S3Client | null = null;

if (keyId && applicationKey && s3Endpoint) {
  try {
    s3Client = new S3Client({
      endpoint: s3Endpoint,
      region: region,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: applicationKey,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Backblaze B2 S3 client:", error);
  }
}

/**
 * Uploads an image file to Backblaze B2 bucket using AWS S3 protocol.
 * Returns public URL on success or base64 data URL as fallback.
 */
export async function uploadImageToB2(file: File): Promise<string> {
  const fileName = `bookmarks/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (s3Client && bucketName) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Backblaze B2 S3 public URL format
      const cleanEndpoint = s3Endpoint?.replace(/^https?:\/\//, '');
      return `https://${bucketName}.${cleanEndpoint}/${fileName}`;
    } catch (err) {
      console.warn("B2 Upload failed (possibly CORS or network restriction), falling back to local storage URL:", err);
    }
  }

  // Fallback: Read file as Data URL if B2 client is unconfigured or blocked by CORS
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
