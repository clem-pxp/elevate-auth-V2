"use client";

import {
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { StepCredentials } from "@/components/onboarding/step-credentials";
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
  const { currentStep, setStep } = useOnboardingStore();
  const isMounted = useMounted();

  const viewsContainerRef = useRef<HTMLDivElement>(null);
  const [viewsContainerWidth, setViewsContainerWidth] = useState(0);

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
    setStep(tabId);
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
              <StepContent step={tab.id} />
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
  const [difference, setDifference] = useState(activeIndex - viewIndex);
  const x = useSpring(calculateViewX(difference, containerWidth), {
    stiffness: 300,
    damping: 30,
    restDelta: 0.5,
  });

  const opacity = useTransform(
    x,
    [-containerWidth * 0.6, 0, containerWidth * 0.6],
    [0, 1, 0],
  );

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
      className="[grid-area:1/1] [transform:translate3d(0,0,0)]"
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

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            whileHover={{ scale: isActive ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex-1 h-8 md:h-9 rounded-full flex items-center justify-center px-4 text-xs md:text-s font-medium cursor-pointer transition-colors duration-200",
              !isActive && "hover:text-strong",
              isActive && "text-static-white",
              isCompleted && !isActive && "text-green-700",
              !isActive && !isCompleted && "text-soft",
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

function StepContent({ step }: { step: OnboardingStep }) {
  switch (step) {
    case 1:
      return <StepCredentials />;
    case 2:
      return <StepPlan />;
    case 3:
      return <StepPlaceholder step={3} title="Paiement" />;
    case 4:
      return <StepPlaceholder step={4} title="Merci" />;
  }
}

function StepPlaceholder({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-20">
      <span className="text-soft">Étape {step}</span>
      <h2 className="h4 text-strong">{title}</h2>
      <p className="text-soft">À implémenter</p>
    </div>
  );
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
