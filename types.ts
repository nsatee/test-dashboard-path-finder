export type OutcomeType = 'right_call' | 'wrong_call' | 'unclear';

export type Decision = {
  id: string;
  title: string;
  date: string;
  outcome: OutcomeType;
  initialConfidence: number; // 0-100
  finalConfidence: number; // 0-100
  stressLevel: number; // 0-10
  tags: string[];
  status: 'framed' | 'sealed' | 'retrospected';
};

export type NetworkNode = {
  id: string;
  group: number;
  val: number; // size
  label: string;
  outcome: OutcomeType;
};

export type NetworkLink = {
  source: string;
  target: string;
  value: number;
};

export type NetworkData = {
  nodes: NetworkNode[];
  links: NetworkLink[];
};

export type FlowData = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

export type PathFinderData = {
  decisions: Decision[];
  networkData: NetworkData;
  flowData: FlowData;
};