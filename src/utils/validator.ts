import dayjs from "dayjs";
import { AxiosResponse } from "axios";

export const MIN_QUERY_LENGTH = 3;
export const MAX_QUERY_LENGTH = 15;
export const MAX_GEOLOCATION_LENGTH = 2;

const stripHtml = (value: string): string =>
  value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "");

export const sanitizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return stripHtml(value).trim().replace(/\s+/g, " ");
};

export const validateResponse = (response: AxiosResponse) => {
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return response;
};

export const validateQuery = (query: unknown): string => {
  const sanitized = sanitizeString(query).toLowerCase();

  if (!sanitized) {
    throw new Error("Missing query parameter");
  }
  if (sanitized.length < MIN_QUERY_LENGTH) {
    throw new Error(
      `Query parameter must be at least ${MIN_QUERY_LENGTH} characters`
    );
  }
  if (sanitized.length > MAX_QUERY_LENGTH) {
    throw new Error(
      `Query parameter must be at most ${MAX_QUERY_LENGTH} characters`
    );
  }
  return sanitized;
};

export const validateGeolocation = (geolocation: unknown): string => {
  const sanitized = sanitizeString(geolocation).toUpperCase();
  if (!sanitized) {
    return "US";
  }
  if (!/^[A-Z]{2}$/.test(sanitized)) {
    throw new Error(
      "Geolocation must be a two-letter country code (e.g. US, FR)"
    );
  }
  return sanitized;
};

export const validateDate = (date: unknown, dateFormat = "YYYY-MM-DD"): string => {
  const sanitized = sanitizeString(date);
  if (!sanitized) {
    throw new Error("Missing date parameter");
  }
  if (!dayjs(sanitized, dateFormat, true).isValid()) {
    throw new Error(`Date must match the format ${dateFormat}`);
  }
  return sanitized;
};

export const validateBoolean = (value: unknown): boolean => value === "true";
