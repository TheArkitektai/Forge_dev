import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Stage = "id_input" | "otp_input" | "verifying" | "success" | "permit_list";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERMITS = [
  {
    id: 1,
    name: "Building Permit",
    status: "Approved",
    badgeClass: "bg-green-100 text-green-700 ring-green-200",
  },
  {
    id: 2,
    name: "Trade License Renewal",
    status: "Pending",
    badgeClass: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  {
    id: 3,
    name: "Event Permit",
    status: "Under Review",
    badgeClass: "bg-sky-100 text-sky-700 ring-sky-200",
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const transition = { duration: 0.28, ease: "easeOut" as const };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Header() {
  return (
    <div className="bg-[#1B2A4A] px-6 py-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#006C35]">
          <ShieldCheck className="size-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Ministry of Interior
          </p>
          <p className="text-sm font-bold leading-tight">
            National Digital Permits Platform
          </p>
          <p className="text-[11px] leading-tight text-white/70" dir="rtl">
            النظام الرقمي الوطني للتصاريح
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-slate-100 px-6 py-3 text-center">
      <p className="text-[11px] text-slate-400">
        Powered by{" "}
        <span className="font-semibold text-slate-600">Arkitekt Forge</span>
      </p>
      <p className="mt-0.5 text-[10px] text-slate-400">
        GCP me-central2 (Dammam, Saudi Arabia)
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="rounded-full bg-[#006C35]/10 px-2 py-0.5 text-[10px] font-semibold text-[#006C35] ring-1 ring-[#006C35]/20">
          PDPL Compliant
        </span>
        <span className="rounded-full bg-[#1B2A4A]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1B2A4A] ring-1 ring-[#1B2A4A]/20">
          NCA ECC Aligned
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage: ID Input
// ---------------------------------------------------------------------------

function IdInputStage({ onSubmit }: { onSubmit: () => void }) {
  const [idValue, setIdValue] = useState("");

  const isValid = /^\d{10}$/.test(idValue);

  return (
    <motion.div
      key="id_input"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex flex-col gap-5 px-6 py-6"
    >
      {/* Welcome copy */}
      <div className="text-center">
        <p
          className="text-2xl font-bold text-[#1B2A4A]"
          dir="rtl"
        >
          مرحبا بكم
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Welcome to the National Digital Platform
        </p>
      </div>

      {/* ID input */}
      <div className="w-full max-w-sm mx-auto space-y-1.5">
        <label
          htmlFor="national-id"
          className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
        >
          National ID Number
        </label>
        <input
          id="national-id"
          type="text"
          inputMode="numeric"
          maxLength={10}
          value={idValue}
          onChange={(e) => setIdValue(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 10-digit ID"
          className={cn(
            "w-full rounded-[12px] border px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400",
            "focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20",
            isValid
              ? "border-[#006C35] bg-green-50/40"
              : "border-slate-200 bg-white"
          )}
        />
        <p className="text-[11px] text-slate-400">
          {idValue.length}/10 digits
        </p>
      </div>

      {/* Send OTP button */}
      <div className="w-full max-w-sm mx-auto">
        <button
          type="button"
          disabled={!isValid}
          onClick={onSubmit}
          className={cn(
            "w-full rounded-[12px] py-3 text-sm font-bold transition",
            isValid
              ? "bg-[#006C35] text-white hover:bg-[#005229] active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          Send OTP
        </button>
      </div>

      {/* Divider */}
      <div className="w-full max-w-sm mx-auto flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] text-slate-400">Or authenticate with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* SSO buttons */}
      <div className="w-full max-w-sm mx-auto flex gap-3">
        {["Absher", "National SSO"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              toast.info("Redirecting to external authentication...")
            }
            className="flex-1 rounded-[12px] border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#006C35]/40 hover:text-[#006C35] active:scale-[0.97]"
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage: OTP Input
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;

function OtpInputStage({ onSubmit }: { onSubmit: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null)
  );

  const allFilled = digits.every((d) => d !== "");

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = cleaned;
    setDigits(updated);
    // Auto-advance
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updated = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setDigits(updated);
    const nextEmpty = updated.findIndex((d) => d === "");
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <motion.div
      key="otp_input"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex flex-col gap-5 px-6 py-6"
    >
      <div className="text-center">
        <p className="text-base font-bold text-slate-900">Enter OTP</p>
        <p className="mt-1 text-sm text-slate-500">
          OTP sent to your registered mobile number
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              "w-10 h-12 text-center text-xl font-semibold border rounded-[12px] outline-none transition",
              "focus:border-[#006C35] focus:ring-2 focus:ring-[#006C35]/20",
              digit
                ? "border-[#006C35] bg-green-50/40 text-[#006C35]"
                : "border-slate-200 bg-white text-slate-900"
            )}
          />
        ))}
      </div>

      {/* Verify button */}
      <div className="w-full max-w-sm mx-auto">
        <button
          type="button"
          disabled={!allFilled}
          onClick={onSubmit}
          className={cn(
            "w-full rounded-[12px] py-3 text-sm font-bold transition",
            allFilled
              ? "bg-[#006C35] text-white hover:bg-[#005229] active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          Verify OTP
        </button>
      </div>

      {/* Resend */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setDigits(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
            toast.info("OTP resent to your mobile number.");
          }}
          className="text-sm font-semibold text-[#006C35] underline-offset-2 hover:underline"
        >
          Resend OTP
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage: Verifying
// ---------------------------------------------------------------------------

function VerifyingStage({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      key="verifying"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex flex-col items-center justify-center gap-4 px-6 py-10"
    >
      {/* Spinner */}
      <div className="size-14 rounded-full border-4 border-slate-100 border-t-[#006C35] animate-spin" />
      <p className="text-sm font-semibold text-slate-700">
        Verifying your identity...
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage: Success
// ---------------------------------------------------------------------------

function SuccessStage({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      key="success"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex flex-col items-center justify-center gap-3 px-6 py-10"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 ring-2 ring-green-200">
        <CheckCircle2 className="size-9 text-[#006C35]" strokeWidth={2} />
      </div>
      <p className="text-xl font-bold text-[#006C35]">Identity Verified</p>
      <p className="text-sm text-slate-500">Welcome, Citizen</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage: Permit List
// ---------------------------------------------------------------------------

function PermitListStage({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="permit_list"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex flex-col gap-4 px-6 py-6"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Authenticated
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">Your Permits</p>
      </div>

      <div className="space-y-2">
        {PERMITS.map((permit) => (
          <div
            key={permit.id}
            className="flex items-center justify-between rounded-[14px] border border-slate-100 bg-slate-50/60 px-4 py-3"
          >
            <p className="text-sm font-semibold text-slate-900">{permit.name}</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                permit.badgeClass
              )}
            >
              {permit.status}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm mx-auto">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-[12px] border-2 border-[#006C35] py-3 text-sm font-bold text-[#006C35] transition hover:bg-[#006C35] hover:text-white active:scale-[0.98]"
        >
          Apply for New Permit
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

export function CitizenAuthPreview() {
  const [stage, setStage] = useState<Stage>("id_input");

  function advance(to: Stage) {
    setStage(to);
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      <Header />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {stage === "id_input" && (
            <IdInputStage onSubmit={() => advance("otp_input")} />
          )}
          {stage === "otp_input" && (
            <OtpInputStage onSubmit={() => advance("verifying")} />
          )}
          {stage === "verifying" && (
            <VerifyingStage onComplete={() => advance("success")} />
          )}
          {stage === "success" && (
            <SuccessStage onComplete={() => advance("permit_list")} />
          )}
          {stage === "permit_list" && (
            <PermitListStage onReset={() => advance("id_input")} />
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
