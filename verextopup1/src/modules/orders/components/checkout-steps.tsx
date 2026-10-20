"use client";

import { Check } from "lucide-react";

const steps = [
  { id: 1, label: "Payment Method" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Complete" },
];

export function CheckoutSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8 px-2">
      {steps.map((step, i) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <div
            key={step.id}
            className="flex items-center flex-1 sm:flex-initial"
          >
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  isDone
                    ? "bg-success text-white"
                    : isActive
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-bg-card border border-border text-text-muted"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`hidden sm:inline text-xs sm:text-sm font-medium whitespace-nowrap ${
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-success"
                      : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-3 min-w-[20px] transition ${
                  step.id < currentStep ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}