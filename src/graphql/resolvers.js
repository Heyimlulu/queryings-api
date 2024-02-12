const {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} = require("../services");

const resolvers = {
  Query: {
    suggestions: async (_, { query }) => {
      const results = {
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
    name: (parent) => parent.name,
    children: (parent) => parent.children,
  },
  Children: {
    questions: (parent) => parent.questions,
    prepositions: (parent) => parent.prepositions,
    comparisons: (parent) => parent.comparisons,
    alphabeticals: (parent) => parent.alphabeticals,
  },
  Questions: {
    howOften: (parent) => parent["how often"],
    howLong: (parent) => parent["how long"],
  },
  Alphabeticals: {
    asterisk: (parent) => parent["*"],
  },
};

module.exports = resolvers;
