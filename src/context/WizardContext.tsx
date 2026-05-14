"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { WizardState, WizardAction, CreatorStyle } from "@/types";

const initialState: WizardState = {
  businessId: null,
  businessData: null,
  icps: [],
  selectedICP: null,
  pillars: [],
  customizationAnswers: null,
  selectedStyles: [],
  generatedContent: [],
  isLoading: false,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_BUSINESS_ID":
      return { ...state, businessId: action.payload };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_BUSINESS_DATA":
      return { ...state, businessData: action.payload };
    case "SET_ICPS":
      return { ...state, icps: action.payload };
    case "SELECT_ICP":
      return { ...state, selectedICP: action.payload };
    case "SET_PILLARS":
      return { ...state, pillars: action.payload };
    case "SET_CUSTOMIZATION":
      return { ...state, customizationAnswers: action.payload };
    case "TOGGLE_STYLE": {
      const exists = state.selectedStyles.find(
        (s: CreatorStyle) => s.id === action.payload.id
      );
      return {
        ...state,
        selectedStyles: exists
          ? state.selectedStyles.filter(
              (s: CreatorStyle) => s.id !== action.payload.id
            )
          : [...state.selectedStyles, action.payload],
      };
    }
    case "SET_CONTENT":
      return { ...state, generatedContent: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return { ...initialState };
    case "SET_FULL_SESSION":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
