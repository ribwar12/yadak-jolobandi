"use client";

import { useEffect, useRef } from "react";
import { cn, toEnglishDigits } from "@/lib/utils";

export function OtpInput({
  length = 5,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
}) {
  const inputRefs = useRef([]);
  const lastCompletedRef = useRef("");

  const digits = Array.from({ length }, (_, idx) => value[idx] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length < length) {
      lastCompletedRef.current = "";
    }
  }, [value, length]);

  const emitValue = (nextChars) => {
    const nextCode = nextChars.join("").slice(0, length);
    onChange?.(nextCode);

    if (nextCode.length === length && nextCode !== lastCompletedRef.current) {
      lastCompletedRef.current = nextCode;
      onComplete?.(nextCode);
    }
  };

  const handleChange = (index, rawValue) => {
    if (disabled) return;
    const normalized = toEnglishDigits(rawValue).replace(/\D/g, "");

    if (!normalized) {
      const next = [...digits];
      next[index] = "";
      emitValue(next);
      return;
    }

    // اگر کاربر بیش از یک رقم (مثلاً با Paste یا Autofill) وارد کرد
    if (normalized.length > 1) {
      const next = [...digits];
      let cursor = index;
      for (const ch of normalized) {
        if (cursor >= length) break;
        next[cursor] = ch;
        cursor += 1;
      }
      emitValue(next);
      const focusIdx = Math.min(cursor, length - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = normalized;
    emitValue(next);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        emitValue(next);
      } else if (index > 0) {
        next[index - 1] = "";
        emitValue(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    if (disabled) return;
    const pasted = toEnglishDigits(e.clipboardData.getData("text") || "").replace(
      /\D/g,
      ""
    );
    if (!pasted) return;

    e.preventDefault();
    const startIdx = pasted.length >= length ? 0 : index;
    const next = [...digits];
    let cursor = startIdx;

    for (const ch of pasted) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor += 1;
    }

    emitValue(next);
    const focusIdx = Math.min(cursor, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div
      dir="ltr"
      className="flex items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="کد تایید ۵ رقمی"
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={length}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`رقم ${idx + 1} کد تایید`}
          className={cn(
            "h-12 w-11 sm:h-14 sm:w-12 rounded-xl border bg-white text-center text-xl font-black text-slate-900 tabular-nums shadow-sm transition-all focus:outline-none focus:ring-2",
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/40"
              : digit
                ? "border-accent focus:border-accent focus:ring-orange-100"
                : "border-slate-300 focus:border-accent focus:ring-orange-100",
            disabled && "opacity-60 cursor-not-allowed bg-slate-50"
          )}
        />
      ))}
    </div>
  );
}
