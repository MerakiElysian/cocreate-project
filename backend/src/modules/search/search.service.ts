import { esClient, PROJECT_INDEX, USER_INDEX } from "../../config/elasticsearch";

export const searchService = {
  async searchProjects(query: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const result = await esClient.search({
      index: PROJECT_INDEX,
      from,
      size: limit,
      query: {
        multi_match: {
          query,
          fields: ["title^3", "description"],
          fuzziness: "AUTO",
        },
      },
    });

    return {
      total:
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total?.value ?? 0,
      items: result.hits.hits.map((hit) => ({ id: hit._id, ...(hit._source as object) })),
    };
  },

  async searchUsers(query: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const result = await esClient.search({
      index: USER_INDEX,
      from,
      size: limit,
      query: {
        multi_match: {
          query,
          fields: ["name^2", "bio"],
          fuzziness: "AUTO",
        },
      },
    });

    return {
      total:
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total?.value ?? 0,
      items: result.hits.hits.map((hit) => ({ id: hit._id, ...(hit._source as object) })),
    };
  },
};
