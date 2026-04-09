export type Tag = 'safety' | 'economy' | 'comfort' | 'performance' | 'technology';

export interface Priority {
  tag: Tag;
  revealed: boolean;
}

export type ObjectionType = 'price' | 'features' | 'practicality' | 'trust';

export interface CustomerArchetype {
  name: string;
  description: string;
  priorities: Tag[];
  objectionType: ObjectionType;
  behavior: string;
  baseBudget: [number, number];
  objectionStrength: [number, number];
}

export type CardType = 'product' | 'value' | 'rapport' | 'reveal' | 'discovery';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  energyCost: number;
  description: string;
  value?: number;
  tags?: Tag[];
  slots?: number;
  infoType?: 'priority' | 'budget' | 'objection' | 'nextAction';
  discoveryType?: 'priority' | 'budget' | 'objection' | 'nextAction';
}

export interface ProductOnBoard {
  id: string;
  baseCard: Card;
  slots: (Card | null)[];
  totalValue: number;
  tags: Tag[];
}

export interface PlayerState {
  reputation: number;
  maxReputation: number;
  rapport: number;
  energy: number;
  maxEnergy: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  exhausted: Card[];
  profit: number;
  currentNegotiationProfit: number;
  quarterlyTarget: number;
  negotiatedCustomers: string[];
}

export interface CustomerState {
  name: string;
  archetype: string;
  budget: number;
  maxBudget: number;
  priorities: Priority[];
  missedTags: Tag[];
  objectionType: ObjectionType;
  objectionStrength: number;
  nextAction?: string;
  revealedBudget?: boolean;
  revealedObjection?: boolean;
  isStalled?: boolean;
  isExcused?: boolean;
}

export type GamePhase = 'floor' | 'negotiation' | 'results' | 'gameover';
