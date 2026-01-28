import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { QueueEvents, Worker } from 'bullmq';
import IORedis from 'ioredis';
import * as fs from 'node:fs';
import * as path from 'node:path';

type ProcessorFn = (job: any) => Promise<any>;

const logger = new Logger('api-worker');

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function getRedisConnection() {
  const url = requireEnv('REDIS_URL');
  // BullMQ recomenda maxRetriesPerRequest=null
  return new IORedis(url, { maxRetriesPerRequest: null });
}

/**
 * Carrega automaticamente todos os processors em:
 * src/api/src/jobs/processors/*.processor.(ts|js)
 *
 * Cada arquivo deve exportar:
 *   export const name = 'queueName';
 *   export const processor = async (job) => {...}
 */
function loadProcessors(): Array<{ queue: string; processor: ProcessorFn }> {
  const processorsDir = path.resolve(__dirname, 'jobs', 'processors');

  if (!fs.existsSync(processorsDir)) {
    logger.warn(
      `Processors folder not found: ${processorsDir}. Worker will stay idle.`,
    );
    return [];
  }

  const files = fs
    .readdirSync(processorsDir)
    .filter(
      (f) =>
        f.endsWith('.processor.js') ||
        f.endsWith('.processor.ts') ||
        f.endsWith('.processor.cjs') ||
        f.endsWith('.processor.mjs'),
    );

  const processors: Array<{ queue: string; processor: ProcessorFn }> = [];

  for (const file of files) {
    const fullPath = path.join(processorsDir, file);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(fullPath);

    const queue = mod.name ?? mod.queue ?? mod.queueName;
    const processor = mod.processor ?? mod.default;

    if (!queue || typeof queue !== 'string') {
      logger.warn(
        `Skipping processor "${file}" (missing export "name" or "queue")`,
      );
      continue;
    }

    if (typeof processor !== 'function') {
      logger.warn(
        `Skipping processor "${file}" (missing export "processor" function)`,
      );
      continue;
    }

    processors.push({ queue, processor });
  }

  return processors;
}

async function bootstrap() {
  const connection = getRedisConnection();

  const processors = loadProcessors();

  if (processors.length === 0) {
    logger.log(
      'Worker started (idle). No processors found in jobs/processors.',
    );
  } else {
    logger.log(`Worker starting with ${processors.length} processor(s)...`);
  }

  // queue events (útil pra debug)
  const queueEventsByName = new Map<string, QueueEvents>();

  for (const { queue, processor } of processors) {
    if (!queueEventsByName.has(queue)) {
      const qe = new QueueEvents(queue, { connection });
      qe.on('completed', ({ jobId }) =>
        logger.log(`[${queue}] completed job ${jobId}`),
      );
      qe.on('failed', ({ jobId, failedReason }) =>
        logger.error(`[${queue}] failed job ${jobId}: ${failedReason}`),
      );
      queueEventsByName.set(queue, qe);
    }

    const worker = new Worker(queue, processor, {
      connection,
      concurrency: 5,
    });

    worker.on('ready', () => logger.log(`[${queue}] worker ready`));
    worker.on('error', (err) => logger.error(`[${queue}] worker error`, err));
  }

  // mantém o processo vivo
  process.on('SIGINT', async () => {
    logger.warn('SIGINT received, shutting down worker...');
    await connection.quit();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.warn('SIGTERM received, shutting down worker...');
    await connection.quit();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  // loga e sai com erro (pra ver no Docker)
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
