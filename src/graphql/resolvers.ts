import { GraphQLError } from "graphql";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services/suggestions";
import { validateGeolocation, validateQuery } from "../utils/validator";
import { logger } from "../utils/logger";
import { SharedContext } from "./context";

const getSuggestions = (query: string, gl: string, context: SharedContext) => {
  try {
    const sanitized = validateQuery(query);
    const country = validateGeolocation(gl);
    logger.info(
      `[graphql] ip=${context.ip ?? "unknown"} user=${
        context.user?.name ?? "anonymous"
      } q="${sanitized}" gl=${country}`
    );

    return {
      name: sanitized,
      gl: country,
      children: {
        questions,
        prepositions,
        comparisons,
        alphabeticals: "abcdefghijklmnopqrstuvwxyz*".split(""),
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Invalid query";
    logger.warn(`[graphql] validation error: ${detail}`);
    throw new GraphQLError("Invalid request");
  }
};

const fetchChildrenCategories = async (
  children: string[],
  keyword: string,
  gl: string,
  hasPrefix = false
) => {
  const suggestions = await Promise.all(
    hasPrefix
      ? children.map((child) => fetchSuggestions(keyword, child + " ", gl))
      : children.map((child) => fetchSuggestions(keyword + " " + child, "", gl))
  );
  const suggestionsResult: Record<string, string[]> = {};
  children.forEach((child, idx) => {
    suggestionsResult[child] = suggestions[idx];
  });
  return suggestionsResult;
};

const resolvers = {
  Query: {
    suggestions: (
      _: any,
      { query, gl }: { query: string; gl?: string },
      context: SharedContext
    ) => getSuggestions(query, gl ?? "", context),
  },
  Suggestions: {
    name: (parent: any) => parent.name,
    children: (parent: any) => parent,
  },
  Children: {
    questions: (parent: any) =>
      fetchChildrenCategories(
        parent.children.questions,
        parent.name,
        parent.gl,
        true
      ),
    prepositions: (parent: any) =>
      fetchChildrenCategories(
        parent.children.prepositions,
        parent.name,
        parent.gl
      ),
    comparisons: (parent: any) =>
      fetchChildrenCategories(
        parent.children.comparisons,
        parent.name,
        parent.gl
      ),
    alphabeticals: (parent: any) =>
      fetchChildrenCategories(
        parent.children.alphabeticals,
        parent.name,
        parent.gl
      ),
  },
  Questions: {
    howOften: (parent: any) => parent["how often"],
    howLong: (parent: any) => parent["how long"],
  },
  Alphabeticals: {
    asterisk: (parent: any) => parent["*"],
  },
};

export default resolvers;
