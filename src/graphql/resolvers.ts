import { GraphQLError } from "graphql";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services";
import { Queries } from "../types/Queries";
import { SharedContext } from "..";

const resolvers = {
  Query: {
    suggestions: async (
      _: any,
      { query }: { query: string },
      context: SharedContext
    ) => {
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

      const results: Queries = {
        name: query,
        children: {
          questions: {},
          prepositions: {},
          comparisons: {},
          alphabeticals: {},
        },
      };

      await Promise.all([
        ...questions.map((question) =>
          fetchSuggestions(query, question + " ").then((data) => {
            results.children.questions[question] = data;
          })
        ),
        ...prepositions.map((preposition) =>
          fetchSuggestions(query + " " + preposition).then((data) => {
            results.children.prepositions[preposition] = data;
          })
        ),
        ...comparisons.map((comparison) =>
          fetchSuggestions(query + " " + comparison).then((data) => {
            results.children.comparisons[comparison] = data;
          })
        ),
        ..."abcdefghijklmnopqrstuvwxyz*".split("").map((letter) =>
          fetchSuggestions(query + " " + letter).then((data) => {
            results.children.alphabeticals[letter] = data;
          })
        ),
      ]);

      return results;
    },
  },
  Suggestions: {
    name: (parent: any) => parent.name,
    children: (parent: any) => parent.children,
  },
  Children: {
    questions: (parent: any) => parent.questions,
    prepositions: (parent: any) => parent.prepositions,
    comparisons: (parent: any) => parent.comparisons,
    alphabeticals: (parent: any) => parent.alphabeticals,
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
