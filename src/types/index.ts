export interface BusinessData {
  businessName: string;
  industryNiche: string;
  targetMarket: string;
  productService: string;
  businessGoals: string;
  uniqueSellingPoints: string;
  reason: string;
}

export interface ICP {
  id: string;
  dbId?: string;
  name: string;
  title: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  onlinePlatforms: string[];
}

export interface ContentTopic {
  id: string;
  title: string;
  description: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  description: string;
  topics: ContentTopic[];
  custom?: boolean;
  saved?: boolean;
}

export interface CustomizationAnswers {
  brandPersonality: string;
  audienceEmotion: string;
  communicationStyle: string;
  uniquePerspective: string;
  targetAgeRange?: string;
}

export interface CreatorStyle {
  id: string;
  name: string;
  handle: string;
  description: string;
  styleTags: string[];
  sampleSnippet: string;
  avatar: string;
  imported?: boolean;
  saved?: boolean;
}

export interface GeneratedContent {
  id: string;
  hook: string;
  body: string;
  cta: string;
  generationGroup?: number;
}

export interface WizardState {
  currentStep: number;
  businessData: BusinessData | null;
  businessId: string | null;
  icps: ICP[];
  selectedICP: ICP | null;
  pillars: ContentPillar[];
  selectedPillarId: string | null;
  customizationAnswers: CustomizationAnswers | null;
  selectedStyles: CreatorStyle[];
  generatedContent: GeneratedContent[];
  isLoading: boolean;
}

export type WizardAction =
  | { type: "SET_BUSINESS_ID"; payload: string }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_BUSINESS_DATA"; payload: BusinessData }
  | { type: "SET_ICPS"; payload: ICP[] }
  | { type: "SELECT_ICP"; payload: ICP }
  | { type: "SET_PILLARS"; payload: ContentPillar[] }
  | { type: "SELECT_PILLAR"; payload: string | null }
  | { type: "SET_CUSTOMIZATION"; payload: CustomizationAnswers | null }
  | { type: "TOGGLE_STYLE"; payload: CreatorStyle }
  | { type: "SET_CONTENT"; payload: GeneratedContent[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" }
  | { type: "SET_FULL_SESSION"; payload: Partial<WizardState> }
  | { type: "GO_BACK"; payload: number }
