export function truncate(text, wordCount) {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return `${words.slice(0, wordCount).join(" ")}…`;
}
