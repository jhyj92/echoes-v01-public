export interface DomainSelectorProps {
  domains: string[];
  onSelect: (domain: string) => void;
}

export interface GuideIntroProps {
  domain: string;
  onSelect: (scenario: string) => void;
}
