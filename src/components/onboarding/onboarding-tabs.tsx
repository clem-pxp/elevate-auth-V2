"use client";

import {
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { StepCheckout } from "@/components/onboarding/step-checkout";
import { StepCredentials } from "@/components/onboarding/step-credentials";
import { StepMerci } from "@/components/onboarding/step-merci";
import { StepPlan } from "@/components/onboarding/step-plan";
import { SocialProofBadge } from "@/components/ui/social-proof-badge";
import { cn } from "@/lib/utils";
import {
  useOnboardingStore,
  type OnboardingStep,
} from "@/lib/stores/onboarding-store";

const tabs: { id: OnboardingStep; label: string }[] = [
  { id: 1, label: "Profil" },
  { id: 2, label: "Plan" },
  { id: 3, label: "Paiement" },
  { id: 4, label: "Merci" },
];

export function OnboardingTabs() {
  const { currentStep, setStep, updateFormData } = useOnboardingStore();
  const isMounted = useMounted();

  const viewsContainerRef = useRef<HTMLDivElement>(null);
  const [viewsContainerWidth, setViewsContainerWidth] = useState(0);

  // Detect session_id from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      updateFormData({ checkoutSessionId: sessionId });
      setStep(4);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [setStep, updateFormData]);

  useEffect(() => {
    const updateWidth = () => {
      if (viewsContainerRef.current) {
        const width = viewsContainerRef.current.getBoundingClientRect().width;
        setViewsContainerWidth(width);
      }
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdateWidth = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 100);
    };

    updateWidth();
    window.addEventListener("resize", debouncedUpdateWidth, { passive: true });
    return () => {
      window.removeEventListener("resize", debouncedUpdateWidth);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleTabClick = (tabId: OnboardingStep) => {
    if (tabId <= currentStep) {
      setStep(tabId);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <SocialProofBadge />
      <TabsNavigation
        tabs={tabs}
        activeStep={currentStep}
        onTabClick={handleTabClick}
      />
      <div
        ref={viewsContainerRef}
        className="grid w-full grid-cols-[repeat(1,minmax(0,1fr))]"
      >
        {isMounted &&
          viewsContainerWidth > 0 &&
          tabs.map((tab, idx) => (
            <View
              key={tab.id}
              containerWidth={viewsContainerWidth}
              viewIndex={idx}
              activeIndex={currentStep - 1}
            >
              <StepContent step={tab.id} currentStep={currentStep} />
            </View>
          ))}
      </div>
    </div>
  );
}

function View({
  children,
  containerWidth,
  viewIndex,
  activeIndex,
}: {
  children: React.ReactNode;
  containerWidth: number;
  viewIndex: number;
  activeIndex: number;
}) {
  const isActive = viewIndex === activeIndex;
  const [difference, setDifference] = useState(activeIndex - viewIndex);
  const x = useSpring(calculateViewX(difference, containerWidth), {
    stiffness: 300,
    damping: 30,
    restDelta: 0.01,
  });

  const opacity = useTransform(x, (xValue) => {
    const threshold = containerWidth * 0.7;
    if (Math.abs(xValue) >= threshold) return 0;
    const normalized = Math.abs(xValue) / threshold;
    return 1 - normalized;
  });

  const blur = useTransform(x, (xValue) => {
    if (containerWidth < 768) return 0;
    const deadZone = containerWidth * 0.1;
    const absX = Math.abs(xValue);
    if (absX < deadZone) return 0;
    const normalized = (absX - deadZone) / (containerWidth * 0.4);
    return Math.min(normalized * 3, 3);
  });

  const filterBlur = useMotionTemplate`blur(${blur}px)`;

  useEffect(() => {
    const newDifference = activeIndex - viewIndex;
    setDifference(newDifference);
    const newX = calculateViewX(newDifference, containerWidth);
    x.set(newX);
  }, [activeIndex, containerWidth, viewIndex, x]);

  return (
    <motion.div
      className={cn(
        "[grid-area:1/1] [transform:translate3d(0,0,0)]",
        !isActive && "pointer-events-none",
      )}
      style={{
        x,
        opacity,
        filter: filterBlur,
      }}
    >
      {children}
    </motion.div>
  );
}

function TabsNavigation({
  tabs,
  activeStep,
  onTabClick,
}: {
  tabs: { id: OnboardingStep; label: string }[];
  activeStep: OnboardingStep;
  onTabClick: (tabId: OnboardingStep) => void;
}) {
  return (
    <nav className="flex w-full bg-strong/4 rounded-full p-1 border-0.5 border-border-base">
      {tabs.map((tab) => {
        const isActive = activeStep === tab.id;
        const isCompleted = tab.id < activeStep;
        const isFuture = tab.id > activeStep;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            whileHover={!isFuture ? { scale: isActive ? 1 : 1.02 } : undefined}
            whileTap={!isFuture ? { scale: 0.98 } : undefined}
            className={cn(
              "relative flex-1 h-8 md:h-9 rounded-full flex items-center justify-center px-4 text-xs md:text-s font-medium transition-colors duration-200",
              isActive && "text-static-white cursor-default",
              isCompleted && "text-green-700 cursor-pointer hover:text-strong",
              isFuture && "text-soft/50 cursor-default",
            )}
          >
            <span className="relative z-10 flex items-center justify-center">
              {tab.label}
            </span>

            {isActive && (
              <motion.span
                layoutId="activeTab"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                className="absolute inset-0 bg-strong rounded-full shadow-sm"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

function StepContent({
  step,
  currentStep,
}: {
  step: OnboardingStep;
  currentStep: OnboardingStep;
}) {
  switch (step) {
    case 1:
      return <StepCredentials />;
    case 2:
      return <StepPlan />;
    case 3:
      return currentStep >= 3 ? <StepCheckout /> : null;
    case 4:
      return currentStep >= 4 ? <StepMerci /> : null;
  }
}

function calculateViewX(difference: number, containerWidth: number) {
  return difference * (containerWidth * 0.75) * -1;
}

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
