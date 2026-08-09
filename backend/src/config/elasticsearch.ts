import { Client } from "@elastic/elasticsearch";
import { env } from "./env";
import { logger } from "../utils/logger";

export const esClient = new Client({ node: env.elasticsearchUrl });

export const PROJECT_INDEX = "projects";
export const USER_INDEX = "users";

export async function ensureIndices(retries = 5, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const projectIndexExists = await esClient.indices.exists({ index: PROJECT_INDEX });
      if (!projectIndexExists) {
        await esClient.indices.create({
          index: PROJECT_INDEX,
          mappings: {
            properties: {
              title: { type: "text" },
              description: { type: "text" },
              ownerId: { type: "keyword" },
              status: { type: "keyword" },
              createdAt: { type: "date" },
            },
          },
        });
      }

      const userIndexExists = await esClient.indices.exists({ index: USER_INDEX });
      if (!userIndexExists) {
        await esClient.indices.create({
          index: USER_INDEX,
          mappings: {
            properties: {
              name: { type: "text" },
              email: { type: "keyword" },
              bio: { type: "text" },
            },
          },
        });
      }
      logger.info("Elasticsearch indices ready");
      return;
    } catch (err) {
      logger.error(`ES setup attempt ${attempt}/${retries} failed: ${(err as Error).message}`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  logger.error("Elasticsearch unavailable after retries — search features will be degraded");
}