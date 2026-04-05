export function findMatchingSnippet(textBeforeCaret, snippets) {
  if (!textBeforeCaret || !Array.isArray(snippets) || snippets.length === 0) {
    return null;
  }

  const sortedSnippets = [...snippets].sort(
    (left, right) => right.trigger.length - left.trigger.length
  );

  return (
    sortedSnippets.find((snippet) => textBeforeCaret.endsWith(snippet.trigger)) ?? null
  );
}
