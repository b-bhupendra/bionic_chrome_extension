document.getElementById('optionsBtn').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('index.html'));
  }
});

const toggle = document.getElementById('enableToggle');
chrome.storage.sync.get({ enabled: true }, (items) => {
  toggle.checked = items.enabled;
});

toggle.addEventListener('change', (e) => {
  chrome.storage.sync.set({ enabled: e.target.checked });
});
