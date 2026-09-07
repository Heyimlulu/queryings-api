import { AxiosResponse } from "axios";

export const MIN_QUERY_LENGTH = 3;
export const MAX_QUERY_LENGTH = 15;

export const validateResponse = (response: AxiosResponse) => {
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return response;
};

export const validateQuery = (query: unknown): string => {
  if (!query || typeof query !== "string") {
    throw new Error("Missing query parameter");
  }
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    throw new Error(
      `Query parameter must be between ${MIN_QUERY_LENGTH} and ${MAX_QUERY_LENGTH} characters`
    );
  }
  return query;
};
