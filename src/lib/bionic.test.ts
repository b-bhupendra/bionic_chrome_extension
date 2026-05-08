import { describe, it, expect } from 'vitest';
import { textToBionic, processWord } from './bionic';

describe('Bionic Reading Processor', () => {
  describe('processWord', () => {
    it('should bold half of a 4-letter word with default fixation (0.5)', () => {
      const result = processWord('word', { fixation: 0.5 });
      expect(result).toBe('<b>wo</b>rd');
    });

    it('should bold the first 3 letters when fixedLetters is set to 3', () => {
      const result = processWord('testing', { fixedLetters: 3 });
      expect(result).toBe('<b>tes</b>ting');
    });

    it('should handle words with punctuation', () => {
      const result = processWord('hello!', { fixation: 0.5 });
      expect(result).toBe('<b>hel</b>lo!');
    });

    it('should handle words with leading punctuation', () => {
      const result = processWord('(wow)', { fixation: 0.5 });
      expect(result).toBe('(<b>wo</b>w)');
    });

    it('should not bold if no letters/numbers are found', () => {
      const result = processWord('!!!', { fixation: 0.5 });
      expect(result).toBe('!!!');
    });
  });

  describe('textToBionic', () => {
    it('should process simple sentences', () => {
      const result = textToBionic('Hello world', { fixedLetters: 2 });
      expect(result).toBe('<b>He</b>llo <b>wo</b>rld');
    });

    it('should respect saccade settings', () => {
      // Saccade 2 means process every 2nd word
      const result = textToBionic('one two three four', { fixedLetters: 1, saccade: 2 });
      expect(result).toBe('one <b>t</b>wo three <b>f</b>our');
    });

    it('should handle complex whitespace and punctuation', () => {
      const input = 'Hello, world! (tested); [fine]';
      const result = textToBionic(input, { fixedLetters: 2 });
      expect(result).toBe('<b>He</b>llo, <b>wo</b>rld! (<b>te</b>sted); [<b>fi</b>ne]');
    });

    it('should handle multi-line text', () => {
      const input = 'Line one\nLine two';
      const result = textToBionic(input, { fixedLetters: 2 });
      expect(result).toBe('<b>Li</b>ne <b>on</b>e\n<b>Li</b>ne <b>tw</b>o');
    });
  });
});
