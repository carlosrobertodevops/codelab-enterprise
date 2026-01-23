// "use server";

// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { createId } from "@paralleldrive/cuid2";

// type UploadFileParams = {
//   file: File;
//   path: string;
// };

// type CloudflareR2Config = {
//   accountId: string;
//   accessId: string;
//   accessKey: string;
//   bucketName: string;
//   fileBasePath: string;
// };

// function getCloudflareR2Config(): CloudflareR2Config {
//   const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
//   const accessId = process.env.CLOUDFLARE_ACCESS_ID;
//   const accessKey = process.env.CLOUDFLARE_ACCESS_KEY;
//   const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
//   const fileBasePath = process.env.CLOUDFLARE_FILE_BASE_PATH;

//   if (!accountId || !accessId || !accessKey || !bucketName || !fileBasePath) {
//     // Importante: NÃO validar/lançar erro em nível de módulo (isso quebra o build do Next).
//     // Valida somente quando a action é chamada.
//     throw new Error("Cloudflare credentials are not set");
//   }

//   return { accountId, accessId, accessKey, bucketName, fileBasePath };
// }

// let _s3: S3Client | null = null;

// function getS3(): { s3: S3Client; cfg: CloudflareR2Config } {
//   const cfg = getCloudflareR2Config();

//   if (!_s3) {
//     _s3 = new S3Client({
//       region: "auto",
//       endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
//       credentials: {
//         accessKeyId: cfg.accessId,
//         secretAccessKey: cfg.accessKey,
//       },
//     });
//   }

//   return { s3: _s3, cfg };
// }

// export const uploadFile = async ({ file, path }: UploadFileParams) => {
//   const { s3, cfg } = getS3();

//   const fileName = file.name;
//   const fileId = createId();
//   const size = file.size;
//   const fileType = file.type;

//   const fileMaxSize = 1024 * 1024 * 5; // 5MB
//   if (size > fileMaxSize) {
//     throw new Error("File size is too large");
//   }

//   const objectKey = `${path}/${fileId}-${fileName}`;

//   const cmd = new PutObjectCommand({
//     Bucket: cfg.bucketName,
//     Key: objectKey,
//     ContentLength: size,
//     ContentType: fileType,
//     Body: Buffer.from(await file.arrayBuffer()),
//   });

//   await s3.send(cmd);

//   const fileUrl = `${cfg.fileBasePath}/${objectKey}`;
//   return { url: fileUrl };
// };

// export const deleteFile = async (url: string) => {
//   const { s3, cfg } = getS3();

//   const prefix = `${cfg.fileBasePath}/`;
//   const objectKey = url.startsWith(prefix) ? url.slice(prefix.length) : url;

//   const cmd = new DeleteObjectCommand({
//     Bucket: cfg.bucketName,
//     Key: objectKey,
//   });

//   await s3.send(cmd);
// };

"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";

type UploadFileParams = {
  file: File;
  path: string;
};

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  // Importante: NÃO validar/lançar erro em nível de módulo (isso quebra o build do Next).
  // Valida somente quando a action é chamada.
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error("R2 credentials are not set");
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

let _s3: S3Client | null = null;

function getS3(): { s3: S3Client; cfg: R2Config } {
  const cfg = getR2Config();

  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }

  return { s3: _s3, cfg };
}

export const uploadFile = async ({ file, path }: UploadFileParams) => {
  const { s3, cfg } = getS3();

  const id = createId();
  const safePath = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const fileName = `${id}-${file.name}`;
  const objectKey = safePath ? `${safePath}/${fileName}` : fileName;

  const buffer = Buffer.from(await file.arrayBuffer());

  const cmd = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: objectKey,
    Body: buffer,
    ContentType: file.type,
  });

  await s3.send(cmd);

  const fileUrl = `${cfg.publicBaseUrl.replace(/\/+$/, "")}/${objectKey}`;

  return {
    url: fileUrl,
    key: objectKey,
  };
};

export const deleteFile = async (url: string) => {
  const { s3, cfg } = getS3();

  const base = cfg.publicBaseUrl.replace(/\/+$/, "");
  const objectKey = url.startsWith(base + "/") ? url.slice(base.length + 1) : url;

  const cmd = new DeleteObjectCommand({
    Bucket: cfg.bucket,
    Key: objectKey,
  });

  await s3.send(cmd);

  return { ok: true };
};
