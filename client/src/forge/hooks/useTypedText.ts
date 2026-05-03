import { useEffect, useState } from "react";

export function useTypedText(text: string, speed: number = 12, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setIsComplete(true);
      return;
    }

    setDisplayed("");
    setIsComplete(false);
    let i = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, isComplete };
}
