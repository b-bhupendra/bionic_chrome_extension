// Function to convert text to bionic format (runs on the page)
function processWord(word, options) {
  if (!word || !word.trim()) return word;
  const match = word.match(/([a-zA-Z0-9]+)/);
  if (!match) return word;

  const coreWord = match[1];
  const prefix = word.substring(0, match.index);
  const suffix = word.substring(match.index + coreWord.length);

  let boldCount = 0;
  if (options.fixedLetters !== undefined && options.fixedLetters > 0) {
    boldCount = Math.min(coreWord.length, options.fixedLetters);
  } else {
    const fixation = options.fixation || 0.5;
    boldCount = Math.ceil(coreWord.length * fixation);
    if (boldCount === 0 && coreWord.length > 0) boldCount = 1;
  }

  const boldPart = coreWord.substring(0, boldCount);
  const restPart = coreWord.substring(boldCount);

  return `${prefix}<b>${boldPart}</b>${restPart}${suffix}`;
}

function textToBionic(text, options) {
  if (!text) return '';
  const saccade = options.saccade || 1;
  const tokens = text.split(/(\s+|[-/\\()\[\]{}.,:;!?]+)/);
  let contentWordIndex = 0;

  const bionicTokens = tokens.map((token) => {
    if (/^(\s+|[-/\\()\[\]{}.,:;!?]+)$/.test(token)) {
      return token;
    }
    if (/[a-zA-Z0-9]/.test(token)) {
      contentWordIndex++;
      if (contentWordIndex % saccade === 0 || saccade === 1) {
        return processWord(token, options);
      }
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
