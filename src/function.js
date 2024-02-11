const axios = require("axios");

const questions = [
  "can",
  "why",
  "who",
  "which",
  "will",
  "how",
  "what",
  "where",
  "are",
  "when",
  "how often",
  "how long",
];
const prepositions = ["near", "without", "to", "with", "is", "for"];
const comparisons = ["like", "versus", "vs", "and", "or", "against"];

const fetchSuggestions = async (keyword, prefix = "") => {
  const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${prefix}${keyword}`;
  try {
    const response = await axios.get(url);
    return response.data[1];
  } catch (error) {
    console.error(error);
    return [];
  }
};

module.exports = {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
};
