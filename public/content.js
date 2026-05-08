// Function to convert text to bionic format (runs on the page)
function textToBionic(text, options) {
  const saccade = options.saccade || 1;
  const fixedLetters = options.fixedLetters; // Default will be handled if not passed, but we pass 3
  const fixation = options.fixation || 0.5;

  const tokens = text.split(/(\s+)/);
  let wordIndex = 0;

  const bionicTokens = tokens.map((token) => {
    if (/^\s+$/.test(token)) {
      return token;
    }
    wordIndex++;
    if (wordIndex % saccade === 0 || saccade === 1) {
      const match = token.match(/[a-zA-Z]/);
      if (!match) return token;

      const lettersOnly = token.replace(/[^a-zA-Z]/g, '');
      if (lettersOnly.length === 0) return token;

      let boldCount = 0;
      if (fixedLetters !== undefined && fixedLetters > 0) {
        boldCount = Math.min(lettersOnly.length, fixedLetters);
      } else {
        boldCount = Math.ceil(lettersOnly.length * fixation);
        if (boldCount === 0 && lettersOnly.length > 0) boldCount = 1;
      }

      let lettersBolded = 0;
      let boldText = '';
      let normalText = '';

      for (let i = 0; i < token.length; i++) {
        const char = token[i];
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
    return token;
  });

  return bionicTokens.join('');
}

function processTextNodes(element, options) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (node.parentNode.nodeName === 'SCRIPT' || 
          node.parentNode.nodeName === 'STYLE' || 
          node.parentNode.nodeName === 'NOSCRIPT' ||
          node.parentNode.nodeName === 'B' ||
          node.parentNode.isContentEditable) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip if parent already processed
      if (node.parentNode.classList && node.parentNode.classList.contains('bionic-converted')) {
        return NodeFilter.FILTER_REJECT;
      }
      if (node.nodeValue.trim() === '') {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodesToReplace = [];
  let node;
  while (node = walker.nextNode()) {
    nodesToReplace.push(node);
  }

  nodesToReplace.forEach(node => {
    const parent = node.parentNode;
    const span = document.createElement('span');
    span.classList.add('bionic-converted');
    span.innerHTML = textToBionic(node.nodeValue, options);
    parent.replaceChild(span, node);
  });
}

function init() {
  chrome.storage.sync.get({
    enabled: true,
    fixedLetters: 3,
    saccade: 1,
    listMode: 'blacklist',
    whitelist: [],
    blacklist: [],
    selectors: []
  }, (items) => {
    if (!items.enabled) return;

    const hostname = window.location.hostname;
    
    let shouldRun = false;
    if (items.listMode === 'whitelist') {
      shouldRun = items.whitelist.some(domain => hostname.includes(domain));
    } else {
      shouldRun = !items.blacklist.some(domain => hostname.includes(domain));
    }

    if (shouldRun) {
      // Add CSS to make bold clearly visible
      const style = document.createElement('style');
      style.textContent = '.bionic-converted b { font-weight: 700 !important; color: inherit; }';
      document.head.appendChild(style);

      const applyBionic = () => {
        if (items.selectors && items.selectors.length > 0) {
          items.selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => processTextNodes(el, items));
            } catch (e) {
              console.warn('Bionic Reader: Invalid selector', selector);
            }
          });
        } else {
          processTextNodes(document.body, items);
        }
      };

      applyBionic();
      
      // Basic observer for dynamic content
      let timeout;
      const observer = new MutationObserver((mutations) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          let hasNewNodes = false;
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) hasNewNodes = true;
          });
          if(hasNewNodes) {
             applyBionic();
          }
        }, 500); // Debounce
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}

// In case document isn't fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
