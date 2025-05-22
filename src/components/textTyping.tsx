import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number;
};

export function TypingText({ text = "", speed = 50 }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let currentIndex = 0;
    const safeText = text ?? "";
    if (!safeText) return;

    const interval = setInterval(() => {
      if (currentIndex < safeText.length) {
        const char = safeText[currentIndex]; // ★ 문자 미리 저장
        setDisplayedText((prev) => prev + char);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <div style={{ whiteSpace: "pre-line" }}>{displayedText}</div>;
}
