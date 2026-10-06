export type ResultsTab = "results" | "comparison";

export interface ResultsHeaderOrientation {
  name: string;
  imageUrl?: string;
}

export interface ResultsHeaderLink {
  url: string;
  label?: string;
}

export interface ResultsHeaderProps {
  orientation?: ResultsHeaderOrientation;
  confidence?: number;
  slogan?: string;
  link?: ResultsHeaderLink;
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
}
