"use client";

import { InputHTMLAttributes, useState } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
};

export default function PasswordInput({
  className,
  wrapperClassName,
  ...inputProps
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? "Hide password" : "Show password";

  return (
    <div className={`password-input-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
      <input {...inputProps} className={className} type={isVisible ? "text" : "password"} />
      <button
        type="button"
        className="password-visibility-toggle"
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        title={toggleLabel}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isVisible ? (
            <>
              <path d="m2 2 20 20" />
              <path d="M6.7 6.7C4.7 8 3.2 9.8 2 12c2.1 3.7 5.8 6 10 6 1.5 0 2.9-.3 4.1-.8" />
              <path d="M10.7 10.7a2 2 0 0 0 2.6 2.6" />
              <path d="M9.9 4.2A11.6 11.6 0 0 1 12 4c4.2 0 7.9 2.3 10 6-.6 1.1-1.3 2-2.2 2.9" />
            </>
          ) : (
            <>
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
              <circle cx="12" cy="12" r="2.5" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
