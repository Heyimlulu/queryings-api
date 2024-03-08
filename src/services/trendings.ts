import axios from "axios";
import dayjs from "dayjs";
import { TrendingsResult } from "../types/Trending";
import { validateResponse } from "../utils/validator";

export const fetchTrendings = async (
  geolocation?: string,
  date?: string
): Promise<TrendingsResult[]> => {
  return axios
    .get("https://trends.google.com/trends/api/dailytrends", {
      params: {
        hl: "en",
        tz: "-60",
        geo: geolocation || "US",
        ns: 15,
        ed: dayjs(date).format("YYYYMMDD"),
      },
    })
    .then(
      (response) =>
        JSON.parse(validateResponse(response).data.slice(5)).default
          .trendingSearchesDays ?? []
    )
    .catch(() => []);
};
