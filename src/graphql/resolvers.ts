import { GraphQLError } from "graphql";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services/suggestions";
import { validateQuery } from "../utils/validator";
import { logger } from "../utils/logger";
import { SharedContext } from "./context";

const getSuggestions = (query: string, context: SharedContext) => {
  try {
    const sanitized = validateQuery(query);
    logger.info(
      `[graphql] ip=${context.ip ?? "unknown"} user=${context.user?.name ?? "anonymous"} q="${sanitized}"`
    );

    return {
      name: sanitized,
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
  hasPrefix = false
) => {
  const suggestions = await Promise.all(
    hasPrefix
      ? children.map((child) => fetchSuggestions(keyword, child + " "))
      : children.map((child) => fetchSuggestions(keyword + " " + child))
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
      { query }: { query: string },
      context: SharedContext
    ) => getSuggestions(query, context),
  },
  Suggestions: {
    name: (parent: any) => parent.name,
    children: (parent: any) => parent,
  },
  Children: {
    questions: (parent: any) =>
      fetchChildrenCategories(parent.children.questions, parent.name, true),
    prepositions: (parent: any) =>
      fetchChildrenCategories(parent.children.prepositions, parent.name),
    comparisons: (parent: any) =>
      fetchChildrenCategories(parent.children.comparisons, parent.name),
    alphabeticals: (parent: any) =>
      fetchChildrenCategories(parent.children.alphabeticals, parent.name),
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
