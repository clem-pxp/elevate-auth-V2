import { create } from "zustand";

export type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: Date | null;
  selectedPlanId: string | null;
}

interface OnboardingState {
  currentStep: OnboardingStep;
  formData: OnboardingFormData;
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  reset: () => void;
}

const initialFormData: OnboardingFormData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: null,
  selectedPlanId: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4) as OnboardingStep,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as OnboardingStep,
    })),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  reset: () => set({ currentStep: 1, formData: initialFormData }),
}));
