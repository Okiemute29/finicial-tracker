import { useState } from "react";

export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  function toggle() {
    setIsVisible((current) => !current);
  }

  return { isVisible, toggle, inputType: isVisible ? "text" : "password" } as const;
}
