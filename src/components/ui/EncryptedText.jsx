import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

export function EncryptedText({
  text,
  className = "",
  encryptedClassName = "text-neutral-500",
  revealedClassName = "text-white",
  revealDelayMs = 50,
  startDelayMs = 0,
}) {
  const [displayed, setDisplayed] = useState(() =>
    text.split("").map(randomChar)
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const revealedRef = useRef(0);

  useEffect(() => {
    let scrambleInterval;
    let revealInterval;

    const startTimeout = setTimeout(() => {
      scrambleInterval = setInterval(() => {
        setDisplayed(
          text
            .split("")
            .map((char, i) => (i < revealedRef.current ? char : randomChar()))
        );
      }, 40);

      revealInterval = setInterval(() => {
        revealedRef.current += 1;
        setRevealedCount(revealedRef.current);
        if (revealedRef.current >= text.length) {
          clearInterval(revealInterval);
          clearInterval(scrambleInterval);
          setDisplayed(text.split(""));
        }
      }, revealDelayMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(scrambleInterval);
      clearInterval(revealInterval);
      revealedRef.current = 0;
      setRevealedCount(0);
      setDisplayed(text.split("").map(randomChar));
    };
  }, [text, revealDelayMs, startDelayMs]);

  return (
    <span className={className}>
      {displayed.map((char, i) => (
        <span
          key={i}
          className={i < revealedCount ? revealedClassName : encryptedClassName}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
