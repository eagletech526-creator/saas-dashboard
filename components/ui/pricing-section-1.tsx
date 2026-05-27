"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { CheckCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useId, useRef, useState } from "react";

const planOptions = {
  pro: {
    name: "Pro",
    monthly: 12,
    annual: 10,
    originalMonthly: 18,
    originalAnnual: 15,
    description: "For growing teams that need project visibility.",
    features: ["Unlimited projects", "Advanced reporting", "Workload planning", "Priority support"],
  },
  business: {
    name: "Business",
    monthly: 29,
    annual: 23,
    originalMonthly: 42,
    originalAnnual: 34,
    description: "For teams managing client delivery at scale.",
    features: ["Client portals", "Custom workflows", "SAML and SSO", "Admin controls"],
  },
};

const PricingSwitch = ({
  button1,
  button2,
  onSwitch,
  className,
  layoutId,
}: {
  button1: string;
  button2: string;
  onSwitch: (value: string) => void;
  className?: string;
  layoutId?: string;
}) => {
  const [selected, setSelected] = useState("0");
  const uniqueId = useId();
  const switchLayoutId = layoutId || `switch-${uniqueId}`;

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div
      className={cn(
        "relative z-10 flex w-full rounded-full border border-gray-200 bg-neutral-50 p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => handleSwitch("0")}
        className={cn(
          "relative z-10 w-full rounded-full px-3 py-1 font-medium transition-colors sm:h-14 sm:px-6 sm:py-2",
          selected === "0" ? "text-white" : "text-muted-foreground hover:text-black",
        )}
      >
        {selected === "0" && (
          <motion.span
            layoutId={switchLayoutId}
            className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900 shadow-sm shadow-black sm:h-14"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative">{button1}</span>
      </button>

      <button
        type="button"
        onClick={() => handleSwitch("1")}
        className={cn(
          "relative z-10 w-full flex-shrink-0 rounded-full px-3 py-1 font-medium transition-colors sm:h-14 sm:px-6 sm:py-2",
          selected === "1" ? "text-white" : "text-muted-foreground hover:text-black",
        )}
      >
        {selected === "1" && (
          <motion.span
            layoutId={switchLayoutId}
            className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900 shadow-sm shadow-black sm:h-14"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative flex items-center justify-center gap-2">{button2}</span>
      </button>
    </div>
  );
};

export default function PricingSection1() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const selectedPlan = isBusiness ? planOptions.business : planOptions.pro;
  const currentPrice = isAnnual ? selectedPlan.annual : selectedPlan.monthly;
  const originalPrice = isAnnual ? selectedPlan.originalAnnual : selectedPlan.originalMonthly;

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.18,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };
  const timelineVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.08,
        duration: 0.45,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const toggleBilling = (value: string) => setIsAnnual(Number.parseInt(value) === 1);
  const togglePlan = (value: string) => setIsBusiness(Number.parseInt(value) === 1);

  return (
    <div id="pricing" className="relative mx-auto min-h-screen w-full overflow-hidden px-4 pt-10" ref={pricingRef}>
      <div className="relative bg-white px-4 py-16">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #0284c7 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <TimelineContent
            as="div"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="mb-4 flex items-center justify-center"
          >
            <Zap className="mr-2 h-5 w-5 fill-sky-500 text-sky-500" />
            <span className="font-medium text-sky-600">ProjectHub plans</span>
          </TimelineContent>

          <h2 className="mb-4 text-3xl font-semibold leading-[120%] text-gray-900 sm:text-4xl md:text-5xl">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse
              containerClassName="justify-center"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0.4,
              }}
            >
              Start simple, scale when your team is ready
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-xl text-gray-600"
          >
            Choose a workspace that fits your team today, then upgrade as projects and reporting needs grow.
          </TimelineContent>
        </div>
      </div>

      <div className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 md:gap-12 sm:grid-cols-2">
            <div>
              <TimelineContent
                as="h3"
                animationNum={2}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="mb-2 text-3xl font-medium text-gray-900"
              >
                What's included in {selectedPlan.name}
              </TimelineContent>

              <TimelineContent
                as="p"
                animationNum={3}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="mb-7 text-gray-600"
              >
                {selectedPlan.description}
              </TimelineContent>

              <div className="space-y-4">
                {selectedPlan.features.map((feature, index) => (
                  <TimelineContent
                    key={feature}
                    as="div"
                    animationNum={4 + index}
                    timelineRef={pricingRef}
                    customVariants={timelineVariants}
                    className="flex items-center"
                  >
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 shadow-md shadow-sky-500">
                      <CheckCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </TimelineContent>
                ))}
              </div>
            </div>

            <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-sky-100">
              <TimelineContent
                as="div"
                animationNum={3}
                timelineRef={pricingRef}
                customVariants={revealVariants}
              >
                <h4 className="mb-2 font-semibold text-gray-900">Billing cycle</h4>
                <p className="mb-2 text-sm text-gray-600">
                  Annual billing saves your team 20%.
                </p>
                <PricingSwitch
                  button1="Monthly"
                  button2="Annual"
                  onSwitch={toggleBilling}
                  className="grid w-full grid-cols-2"
                />
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={4}
                timelineRef={pricingRef}
                customVariants={revealVariants}
              >
                <h4 className="mb-1 font-semibold text-gray-900">Workspace plan</h4>
                <p className="mb-2 text-sm text-gray-600">
                  Pick the level of visibility and control your team needs.
                </p>
                <PricingSwitch
                  button1="Pro"
                  button2="Business"
                  onSwitch={togglePlan}
                  className="grid w-full grid-cols-2"
                />
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={5}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="grid grid-cols-2 items-center gap-2 px-2 text-center"
              >
                <div className="mb-4 flex items-center">
                  <span className="text-5xl font-semibold text-gray-900">
                    $
                    <NumberFlow value={currentPrice} className="text-5xl font-semibold" />
                  </span>
                  <span className="relative ml-2 text-xl text-gray-600 line-through before:absolute before:left-0 before:top-3.5 before:z-10 before:h-0.5 before:w-full before:bg-gray-800 before:content-['']">
                    $
                    <NumberFlow value={originalPrice} className="text-xl font-semibold line-through" />
                  </span>
                  <span className="ml-2 text-left text-sm text-gray-500">/user<br />month</span>
                </div>
                <TimelineContent
                  as="button"
                  animationNum={6}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                  className="h-10 w-full rounded-full border-4 border-sky-600 bg-gradient-to-t from-sky-600 via-sky-500 to-sky-600 text-xl font-semibold text-white shadow-sm shadow-sky-600 sm:h-16"
                >
                  Start
                </TimelineContent>
              </TimelineContent>

              <Button variant="outline" className="h-11 w-full rounded-full border-slate-200">
                Start with Starter for $0
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
