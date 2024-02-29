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
  if (query.length < 3 || query.length > 15)
    throw new GraphQLError("Query length should be between 3 and 15");

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
