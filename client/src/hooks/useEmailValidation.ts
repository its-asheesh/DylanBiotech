// src/hooks/useEmailValidation.ts
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useDebounce } from "use-debounce";

export const useEmailValidation = (setError: any, clearErrors: any) => {
  const { watch } = useFormContext();
  const emailValue = watch("email");
  const [debouncedEmail] = useDebounce(emailValue, 500);

  useEffect(() => {
    if (!debouncedEmail) return;

    const validateEmail = async () => {
      try {
        const response = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(debouncedEmail)}`
        );
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();

        if (!data.exists) {
          setError("email", {
            type: "manual",
            message: "This email is not registered",
          });
        } else {
          clearErrors("email");
        }
      } catch (err) {
        console.error("Failed to validate email:", err);
      }
    };

    validateEmail();
  }, [debouncedEmail, setError, clearErrors]);
};