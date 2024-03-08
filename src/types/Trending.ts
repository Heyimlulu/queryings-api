export type TrendingsResult = {
  date: string;
  formattedDate: string;
  trendingSearches: TrendingSearch[];
};

type TrendingSearch = {
  title: {
    query: string;
    exploreLink: string;
  };
  formattedTraffic: string;
  relatedQueries: {
    queries: string;
    exploreLink: string;
  }[];
  image: Image;
  articles: {
    title: string;
    timeAgo: string;
    source: string;
    image: Image;
    url: string;
    snippet: string;
  }[];
  shareUrl: string;
};

type Image = {
  newsUrl: string;
  source: string;
  imageUrl: string;
};
