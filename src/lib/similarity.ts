function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

export function computeSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((word) => {
    if (setB.has(word)) intersection++;
  });

  const union = new Set([...setA, ...setB]).size;
  return Math.round((intersection / union) * 100);
}

export function findCommonSentences(texts: string[]): Set<string> {
  const allSentences = texts.map(
    (t) => (t.match(/[^.!?]+[.!?]+/g) || []).map((s) => s.trim().toLowerCase())
  );

  const common = new Set<string>();

  for (let i = 0; i < allSentences.length; i++) {
    for (let j = i + 1; j < allSentences.length; j++) {
      for (const sentA of allSentences[i]) {
        const wordsA = new Set(sentA.split(/\s+/).filter((w) => w.length > 3));
        for (const sentB of allSentences[j]) {
          const wordsB = new Set(sentB.split(/\s+/).filter((w) => w.length > 3));
          let overlap = 0;
          wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });
          if (wordsA.size > 0 && overlap / wordsA.size > 0.5) {
            common.add(sentA);
            common.add(sentB);
          }
        }
      }
    }
  }
  return common;
}
