export type Queries = {
  name: string;
  children: Children;
};

type Children = {
  questions: Record<string, string[]>;
  prepositions: Record<string, string[]>;
  comparisons: Record<string, string[]>;
  alphabeticals: Record<string, string[]>;
};
