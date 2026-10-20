"use client";

const steps = [
  {
    num: "1",
    title: "Select Package",
    desc: "Choose your desired package and enter your game info.",
  },
  {
    num: "2",
    title: "Make Payment",
    desc: "Complete your payment using our secure payment methods.",
  },
  {
    num: "3",
    title: "Get Your Product",
    desc: "Your digital product will be delivered instantly.",
  },
];

export function HowItWorks() {
  return (
    <div className="space-y-5">
      {steps.map((step) => (
        <div key={step.num} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            {step.num}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-text-primary text-sm">
              {step.title}
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {step.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}