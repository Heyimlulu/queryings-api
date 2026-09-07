import axios from "axios";
import dayjs from "dayjs";
import { TrendingsResult } from "../types/Trending";
import { validateResponse } from "../utils/validator";

export const fetchTrendings = async (
  geolocation?: string,
  date?: string
): Promise<TrendingsResult[]> => {
  try {
    const response = await axios.get(
      "https://trends.google.com/trends/api/dailytrends",
      {
        params: {
          hl: "en",
          tz: "-60",
          geo: geolocation || "US",
          ns: 15,
          ed: dayjs(date).format("YYYYMMDD"),
        },
      }
    );

    validateResponse(response);

    // Google Trends returns a JSON-like payload prefixed with 5 characters.
    const payload = JSON.parse(response.data.slice(5));
    return payload?.default?.trendingSearchesDays ?? [];
  } catch (error) {
    // Fail gracefully: the upstream API format can change and the date may have no data.
    return [];
  }
};
