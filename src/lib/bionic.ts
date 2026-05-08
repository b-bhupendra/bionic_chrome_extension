export interface BionicOptions {
  fixation?: number;
  saccade?: number;
  fixedLetters?: number;
}

/**
 * Processes a single word and returns bolded HTML string.
 */
export function processWord(word: string, options: BionicOptions): string {
  // Handle empty or whitespace-only words
  if (!word || !word.trim()) return word;

  // Find the boundaries of the actual word characters (ignoring leading/trailing punctuation)
  const match = word.match(/([a-zA-Z0-9]+)/);
  if (!match) return word;

  const coreWord = match[1];
  const prefix = word.substring(0, match.index);
  const suffix = word.substring(match.index! + coreWord.length);

  let boldCount = 0;
  if (options.fixedLetters !== undefined && options.fixedLetters > 0) {
    boldCount = Math.min(coreWord.length, options.fixedLetters);
  } else {
    const fixation = options.fixation ?? 0.5;
    boldCount = Math.ceil(coreWord.length * fixation);
    if (boldCount === 0 && coreWord.length > 0) boldCount = 1;
  }

  const boldPart = coreWord.substring(0, boldCount);
  const restPart = coreWord.substring(boldCount);

  return `${prefix}<b>${boldPart}</b>${restPart}${suffix}`;
}

/**
 * Converts a block of text into bionic format.
 */
export function textToBionic(text: string, options: BionicOptions = {}): string {
  if (!text) return '';
  
  const saccade = options.saccade ?? 1;

  // Split by whitespace and common delimiters while preserving them
  const tokens = text.split(/(\s+|[-/\\()\[\]{}.,:;!?]+)/);
  let contentWordIndex = 0;

  const bionicTokens = tokens.map((token) => {
    // If it's a delimiter or whitespace, return as is
    if (/^(\s+|[-/\\()\[\]{}.,:;!?]+)$/.test(token)) {
      return token;
    }

    // Only process "words" that Contain letters/numbers
    if (/[a-zA-Z0-9]/.test(token)) {
      contentWordIndex++;
      // Saccade logic: only process every Nth word if saccade > 1
      if (contentWordIndex % saccade === 0 || saccade === 1) {
        return processWord(token, options);
      }
    }
    
    return token;
  });

  return bionicTokens.join('');
}
