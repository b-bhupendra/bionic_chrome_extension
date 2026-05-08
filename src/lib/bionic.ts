export interface BionicOptions {
  fixation?: number;
  saccade?: number;
  fixedLetters?: number;
}

function processWord(word: string, options: BionicOptions): string {
  const match = word.match(/[a-zA-Z]/);
  if (!match) return word;

  const lettersOnly = word.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length === 0) return word;

  let boldCount = 0;
  if (options.fixedLetters !== undefined && options.fixedLetters > 0) {
    boldCount = Math.min(lettersOnly.length, options.fixedLetters);
  } else {
    const fixation = options.fixation ?? 0.5;
    boldCount = Math.ceil(lettersOnly.length * fixation);
    if (boldCount === 0 && lettersOnly.length > 0) boldCount = 1;
  }

  let lettersBolded = 0;
  let boldText = '';
  let normalText = '';

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (/[a-zA-Z]/.test(char)) {
      if (lettersBolded < boldCount) {
        boldText += char;
        lettersBolded++;
      } else {
        normalText += char;
      }
    } else {
      if (lettersBolded < boldCount) {
        boldText += char;
      } else {
        normalText += char;
      }
    }
  }

  return `<b>${boldText}</b>${normalText}`;
}

export function textToBionic(text: string, options: BionicOptions = {}): string {
  const saccade = options.saccade ?? 1;

  // Split by whitespace to preserve spacing
  const tokens = text.split(/(\s+)/);
  let wordIndex = 0;

  const bionicTokens = tokens.map((token) => {
    if (/^\s+$/.test(token)) {
      return token; // Preserve whitespace
    }
    wordIndex++;
    if (wordIndex % saccade === 0 || saccade === 1) {
      return processWord(token, options);
    }
    return token;
  });

  return bionicTokens.join('');
}
