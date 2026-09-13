export type Category =
  | "paper"
  | "model-release"
  | "product"
  | "company"
  | "policy"
  | "drama"
  | "advance"
  | "infrastructure";

export type Source = {
  label: string;
  url: string;
  type?: string;
  verified?: boolean;
  verifiedTitle?: string;
  verifiedVia?: string;
  note?: string;
};

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  category: Category;
  organizations: string[];
  summary: string;
  significance: string;
  tags: string[];
  sources?: Source[];
  verified?: boolean;
  confidence?: "high" | "medium" | "low";
};

export type YearMeta = {
  year: number;
  description: string;
  count: number;
};
