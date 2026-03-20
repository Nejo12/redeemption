import "dotenv/config";
import { Worker } from "bullmq";
import { S3Client } from "@aws-sdk/client-s3";
import IORedis from "ioredis";
import puppeteer from "puppeteer";

type RedisJobData = {
  templateId: string;
  templateVersion: string;
};

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "http://localhost:9000";
const S3_BUCKET = process.env.S3_BUCKET ?? "moments-dev";

// S3 client is created up-front so later job processors can upload artifacts.
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "local",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "local",
  },
});

void s3Client;

const redisUrlParsed = new URL(REDIS_URL);
const connection = {
  host: redisUrlParsed.hostname,
  port: Number(redisUrlParsed.port || 6379),
  password: redisUrlParsed.password ? redisUrlParsed.password : undefined,
};
const queueName = "template-rendering";

let worker: Worker<RedisJobData, void> | null = null;

async function renderPdfStub(_jobData: RedisJobData): Promise<void> {
  // Stub: we only verify Chromium launch works; real template rendering comes later.
  const browser = await puppeteer.launch({ headless: true });
  await browser.close();
}

async function assertRedisAvailable(): Promise<void> {
  const redis = new IORedis({
    ...connection,
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  try {
    await redis.connect();
    await redis.ping();
  } catch {
    throw new Error(
      `Redis is unavailable at ${REDIS_URL}. Start local infrastructure with "npm run infra:up" before running the worker.`,
    );
  } finally {
    redis.disconnect();
  }
}

async function shutdown(): Promise<void> {
  if (worker) {
    await worker.close();
  }
}

async function startWorker(): Promise<void> {
  console.log(`worker: listening on Redis (${REDIS_URL}) for queue "${queueName}"`);
  console.log(`worker: target bucket "${S3_BUCKET}" via ${S3_ENDPOINT}`);

  await assertRedisAvailable();

  worker = new Worker<RedisJobData, void>(
    queueName,
    async (job) => {
      await renderPdfStub(job.data);
    },
    { connection },
  );

  worker.on("completed", (job) => {
    console.log(`worker: completed job ${job.id} (${queueName})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`worker: failed job ${job?.id} (${queueName}):`, err);
  });
}

process.on("SIGINT", () => {
  void shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  void shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

void startWorker().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`worker: startup failed: ${error.message}`);
  } else {
    console.error("worker: startup failed", error);
  }
  process.exit(1);
});
