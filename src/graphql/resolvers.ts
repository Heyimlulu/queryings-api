import { GraphQLError } from "graphql";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services";
import { SharedContext } from "./context";

const getSuggestions = (query: string, context: SharedContext) => {
  if (!query) throw new GraphQLError("Missing query parameter");
  if (query.length < 3)
    throw new GraphQLError(
      "query parameter should be at least 3 characters long"
    );
  if (query.length > 15)
    throw new GraphQLError(
      "query parameter should be at most 15 characters long"
    );

  if (!context.client)
    throw new GraphQLError("Missing x-client-referer header");
  if (context.client !== "queryings-app")
    throw new GraphQLError("Unauthorized client");

  return {
    name: query,
    children: {
      questions,
      prepositions,
      comparisons,
      alphabeticals: "abcdefghijklmnopqrstuvwxyz*".split(""),
    },
  };
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
