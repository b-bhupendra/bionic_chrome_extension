import { Settings, Download, Copy, RefreshCw, Moon, Sun, Type, Plus, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { textToBionic } from './lib/bionic';
import { useExtensionStorage } from './lib/useExtensionStorage';

export default function App() {
  const [text, setText] = useState('Bionic reading is a new method facilitating the reading process by guiding the eyes through text with artificial fixation points.');

  const SAMPLES = {
    ADHD: "Research suggests that Bionic Reading can significantly improve comprehension for individuals with ADHD by reducing cognitive load during lexical access and fixation transitions.",
    TECHNICAL: "The algorithm utilizes a dual-mode approach: 1. It identifies lexical tokens using regex. 2. It applies character-level bolding based on a fixation parameter (0.1 - 1.0) or a fixed integer value.",
    LITERATURE: "It was the best of times, it was the worst of times; it was the age of wisdom, it was the age of foolishness; it was the epoch of belief, it was the epoch of incredulity.",
    CODE: "function calculateFixation(word) { const length = word.length; return Math.ceil(length * 0.5); }"
  };
  const [bionicHtml, setBionicHtml] = useState('');
  
  // Storage Settings
  const [fixedLetters, setFixedLetters] = useExtensionStorage('fixedLetters', 3);
  const [saccade, setSaccade] = useExtensionStorage('saccade', 1);
  const [listMode, setListMode] = useExtensionStorage<'whitelist' | 'blacklist'>('listMode', 'blacklist');
  const [whitelist, setWhitelist] = useExtensionStorage<string[]>('whitelist', []);
  const [blacklist, setBlacklist] = useExtensionStorage<string[]>('blacklist', []);
  const [selectors, setSelectors] = useExtensionStorage<string[]>('selectors', []);

  // UI Settings
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newSelector, setNewSelector] = useState('');

  useEffect(() => {
    setBionicHtml(textToBionic(text, { fixedLetters, saccade }));
  }, [text, fixedLetters, saccade]);

  const handleCopy = () => {
    const blobHtml = new Blob([bionicHtml], { type: 'text/html' });
    const blobText = new Blob([text], { type: 'text/plain' });
    try {
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      navigator.clipboard.write(data);
      alert('Copied to clipboard!');
    } catch (err) {
      navigator.clipboard.writeText(bionicHtml);
      alert('Copied HTML to clipboard!');
    }
  };

  const currentList = listMode === 'whitelist' ? whitelist : blacklist;
  const setList = listMode === 'whitelist' ? setWhitelist : setBlacklist;

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const domain = newDomain.trim().toLowerCase();
    if (!currentList.includes(domain)) {
      setList([...currentList, domain]);
    }
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    setList(currentList.filter(d => d !== domain));
  };

  const addSelector = () => {
    if (!newSelector.trim()) return;
    const selector = newSelector.trim();
    if (!selectors.includes(selector)) {
      setSelectors([...selectors, selector]);
    }
    setNewSelector('');
  };

  const removeSelector = (selector: string) => {
    setSelectors(selectors.filter(s => s !== selector));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ease-in-out ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-900'}`}>
      {/* Header */}
      <header className={`px-6 py-4 border-b ${darkMode ? 'border-zinc-800' : 'border-stone-200'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}>
            <Type className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">Bionic Reader Extension Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showSettings || darkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-stone-200 text-stone-800'}`}
          >
            <Settings className="w-4 h-4" />
            Site Access
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-200 text-stone-500'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 h-[calc(100vh-73px)] flex flex-col md:flex-row gap-6 relative">
        
        {/* Settings Overlay */}
        {showSettings && (
          <div className={`absolute top-0 right-6 z-10 w-96 rounded-2xl border shadow-xl p-6 ${darkMode ? 'bg-zinc-900 border-zinc-700 shadow-black/50' : 'bg-white border-stone-200'} flex flex-col gap-4 mt-4`}>
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-base">Site Access Configuration</h3>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-inherit"><X className="w-5 h-5"/></button>
             </div>
             <div>
                <label className="text-sm font-medium mb-1 block">Operating Mode</label>
                <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-zinc-800' : 'bg-stone-100'}`}>
                  <button 
                     onClick={() => setListMode('blacklist')}
                     className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${listMode === 'blacklist' ? (darkMode ? 'bg-zinc-700 text-white' : 'bg-white shadow leading-none') : 'text-zinc-500'}`}>
                    Run Everywhere Except
                  </button>
                  <button 
                     onClick={() => setListMode('whitelist')}
                     className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${listMode === 'whitelist' ? (darkMode ? 'bg-zinc-700 text-white' : 'bg-white shadow leading-none') : 'text-zinc-500'}`}>
                    Run Only On
                  </button>
                </div>
             </div>
             
             <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium">
                  {listMode === 'whitelist' ? 'Whitelisted Sites' : 'Blacklisted Sites'}
                </label>
                <div className="flex gap-2">
                   <input
                     type="text"
                     placeholder="e.g. example.com"
                     value={newDomain}
                     onChange={(e) => setNewDomain(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                     className={`flex-1 px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-stone-300'}`}
                   />
                   <button 
                     onClick={addDomain}
                     className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
                
                <ul className={`mt-2 border rounded-lg overflow-hidden h-32 overflow-y-auto ${darkMode ? 'border-zinc-700' : 'border-stone-200'}`}>
                  {currentList.length === 0 ? (
                    <li className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>No sites added</li>
                  ) : (
                    currentList.map(domain => (
                      <li key={domain} className={`flex justify-between items-center p-3 text-sm border-b last:border-0 ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-100 bg-stone-50/50'}`}>
                        <span>{domain}</span>
                        <button onClick={() => removeDomain(domain)} className="text-red-500 hover:text-red-600 p-1">
                           <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
             </div>

             <div className="flex flex-col gap-2 mt-2 border-t pt-4 dark:border-zinc-800 border-stone-100">
                <label className="text-sm font-medium">Selective Target Selectors</label>
                <p className={`text-[11px] mb-1 ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                  Specify CSS selectors (e.g. <code>article</code>, <code>.main-content</code>, <code>#wiki-body</code>) to only convert specific areas. Leave empty to convert everything.
                </p>
                <div className="flex gap-2">
                   <input
                     type="text"
                     placeholder="e.g. article, .content"
                     value={newSelector}
                     onChange={(e) => setNewSelector(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addSelector()}
                     className={`flex-1 px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-stone-300'}`}
                   />
                   <button 
                     onClick={addSelector}
                     className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
                
                <ul className={`mt-2 border rounded-lg overflow-hidden h-32 overflow-y-auto ${darkMode ? 'border-zinc-700' : 'border-stone-200'}`}>
                  {selectors.length === 0 ? (
                    <li className={`p-4 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>All page text targeted</li>
                  ) : (
                    selectors.map(selector => (
                      <li key={selector} className={`flex justify-between items-center p-3 text-sm border-b last:border-0 ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-100 bg-stone-50/50'}`}>
                        <code className="bg-indigo-500/10 text-indigo-400 px-1 rounded">{selector}</code>
                        <button onClick={() => removeSelector(selector)} className="text-red-500 hover:text-red-600 p-1">
                           <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
             </div>
          </div>
        )}

        {/* Left Column: Input */}
        <section className={`flex-1 flex flex-col rounded-2xl overflow-hidden border ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-200 bg-white'}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}>
            <div className="flex items-center gap-2">
              <h2 className={`font-medium text-sm ${darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>Test Preview Input</h2>
              <div className="flex gap-1 ml-2">
                {Object.entries(SAMPLES).map(([key, value]) => (
                  <button 
                    key={key}
                    onClick={() => setText(value)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${darkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-500' : 'border-stone-200 hover:bg-stone-50 text-stone-400'}`}>
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setText('')}
              className={`text-xs px-2 py-1 rounded transition-colors ${darkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
            >
              Clear
            </button>
          </div>
          <textarea
            className="flex-1 w-full p-6 bg-transparent resize-none focus:outline-none focus:ring-0 leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to test the bionic reading format..."
            style={{ fontSize: '16px' }}
          />
        </section>

        {/* Right Column: Output & Settings */}
        <section className={`flex-1 flex flex-col rounded-2xl overflow-hidden border shadow-sm ${darkMode ? 'border-zinc-800 bg-zinc-900/80 shadow-black/20' : 'border-stone-200 bg-white'}`}>
          {/* Settings Toolbar */}
          <div className={`px-4 py-3 border-b flex items-center gap-6 overflow-x-auto ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>Bold Letters</span>
              <input 
                type="range" min="1" max="5" step="1" 
                value={fixedLetters} onChange={(e) => setFixedLetters(parseInt(e.target.value))}
                className="w-24 accent-indigo-500" 
              />
              <span className={`text-xs font-mono w-4 text-center ${darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>{fixedLetters}</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>Saccade</span>
              <input 
                type="range" min="1" max="5" step="1" 
                value={saccade} onChange={(e) => setSaccade(parseInt(e.target.value))}
                className="w-24 accent-indigo-500" 
              />
              <span className={`text-xs font-mono w-4 text-center ${darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>{saccade}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-l pl-4 border-stone-200 dark:border-zinc-800">
               <button 
                 onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                 className={`w-6 h-6 flex items-center justify-center rounded text-sm font-medium ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-stone-100'}`}>
                 A-
               </button>
               <button 
                 onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                 className={`w-6 h-6 flex items-center justify-center rounded text-sm font-medium ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-stone-100'}`}>
                 A+
               </button>
            </div>
            
            <div className="flex-1"></div>
            
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-colors
                ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>

          {/* Reader View */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {text.trim() === '' ? (
              <div className="h-full flex items-center justify-center">
                 <p className={`text-sm ${darkMode ? 'text-zinc-600' : 'text-stone-400'}`}>No text to display</p>
              </div>
            ) : (
              <div 
                className="bionic-output font-sans whitespace-pre-wrap word-break-normal"
                style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: lineHeight,
                  letterSpacing: '0.01em',
                }}
                dangerouslySetInnerHTML={{ __html: bionicHtml }}
              />
            )}
          </div>
        </section>

      </main>

      {/* Global CSS for bolding */}
      <style dangerouslySetInnerHTML={{__html: `
        .bionic-output b {
          font-weight: 700;
          color: ${darkMode ? '#ffffff' : '#000000'};
        }
        .bionic-output {
           color: ${darkMode ? '#a1a1aa' : '#57534e'}; /* zinc-400 : stone-600 */
        }
      `}} />
    </div>
  );
}
