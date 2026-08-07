import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Delete, 
  RotateCcw, 
  Copy, 
  Check, 
  DollarSign, 
  Plus, 
  Minus, 
  Percent, 
  Divide, 
  Sparkles,
  History
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDues?: number;
  lateFee?: number;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  baseDues = 25,
  lateFee = 5
}) => {
  const { language } = useLanguage();
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNumber = (digit: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    if (display === 'Error') return;
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length === 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    if (!equation || display === 'Error') return;

    try {
      const fullExp = equation + display;
      const sanitizedExp = fullExp
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/ 100 *');

      // Safe evaluation using Function
      const rawResult = new Function(`return ${sanitizedExp}`)();
      const numResult = Number(rawResult);

      if (isNaN(numResult) || !isFinite(numResult)) {
        setDisplay('Error');
        return;
      }

      // Format to maximum 2 decimal places if needed
      const formattedResult = Number.isInteger(numResult)
        ? numResult.toString()
        : Math.round(numResult * 100) / 100 + '';

      const historyEntry = `${fullExp} = ${formattedResult}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      setDisplay(formattedResult);
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleAddPreset = (amount: number, label: string) => {
    const currentNum = parseFloat(display) || 0;
    const newTotal = currentNum + amount;
    const formatted = Math.round(newTotal * 100) / 100 + '';
    const entry = `${currentNum > 0 ? `${currentNum} + ` : ''}${label} ($${amount}) = $${formatted}`;
    setHistory(prev => [entry, ...prev.slice(0, 9)]);
    setDisplay(formatted);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden relative flex flex-col transition-colors">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/30 text-indigo-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                {language === 'es' ? 'Calculadora de Cuotas' : 'Financial Dues Calculator'}
              </h3>
              <p className="text-[10px] text-indigo-200 font-mono">
                {language === 'es' ? 'Cálculos rápidos y recargos' : 'Quick balance & late fee math'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHistoryOpen 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Calculation History"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-950 text-right space-y-1 relative border-b border-slate-800">
          <div className="text-[11px] font-mono text-indigo-400 h-4 overflow-hidden truncate">
            {equation || '\u00A0'}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleCopyResult}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
              title="Copy result to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono text-[10px]">{copied ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar' : 'Copy')}</span>
            </button>

            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight truncate">
              ${display}
            </div>
          </div>
        </div>

        {/* Optional History Drawer */}
        {isHistoryOpen && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-mono space-y-1 max-h-36 overflow-y-auto">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
              <span>{language === 'es' ? 'Historial de Operaciones' : 'Calculation Tape'}</span>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="text-rose-400 hover:underline cursor-pointer"
                >
                  {language === 'es' ? 'Limpiar' : 'Clear'}
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2 text-center">
                {language === 'es' ? 'Sin historial reciente' : 'No calculations yet'}
              </p>
            ) : (
              history.map((item, idx) => (
                <div key={`hist-${idx}`} className="text-slate-300 hover:text-white text-[11px] py-0.5 border-b border-slate-800/50 flex justify-between">
                  <span>{item}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Dues Preset Bar */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto [scrollbar-width:none]">
          <button
            onClick={() => handleAddPreset(baseDues, 'Base Dues')}
            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all whitespace-nowrap cursor-pointer"
          >
            + Cuota Base (${baseDues})
          </button>
          <button
            onClick={() => handleAddPreset(lateFee, 'Late Fee')}
            className="px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl border border-amber-200 dark:border-amber-800 transition-all whitespace-nowrap cursor-pointer"
          >
            + Recargo 1 Sem (${lateFee})
          </button>
          <button
            onClick={() => handleAddPreset(lateFee * 2, '2w Late')}
            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-800 transition-all whitespace-nowrap cursor-pointer"
          >
            + 2 Sem (${lateFee * 2})
          </button>
        </div>

        {/* Keypad Grid */}
        <div className="p-3 bg-white dark:bg-slate-900 grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="p-3 font-extrabold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-2xl border border-rose-200 dark:border-rose-800/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            C
          </button>

          <button
            onClick={handleBackspace}
            className="p-3 font-extrabold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleOperation('%')}
            className="p-3 font-extrabold text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          >
            %
          </button>

          <button
            onClick={() => handleOperation('÷')}
            className="p-3 font-extrabold text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => handleNumber('7')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">7</button>
          <button onClick={() => handleNumber('8')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">8</button>
          <button onClick={() => handleNumber('9')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">9</button>
          <button onClick={() => handleOperation('×')} className="p-3 font-extrabold text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center">×</button>

          {/* Row 3 */}
          <button onClick={() => handleNumber('4')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">4</button>
          <button onClick={() => handleNumber('5')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">5</button>
          <button onClick={() => handleNumber('6')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">6</button>
          <button onClick={() => handleOperation('-')} className="p-3 font-extrabold text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center">-</button>

          {/* Row 4 */}
          <button onClick={() => handleNumber('1')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">1</button>
          <button onClick={() => handleNumber('2')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">2</button>
          <button onClick={() => handleNumber('3')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">3</button>
          <button onClick={() => handleOperation('+')} className="p-3 font-extrabold text-sm text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center">+</button>

          {/* Row 5 */}
          <button onClick={() => handleNumber('0')} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95 col-span-2">0</button>
          <button onClick={handleDecimal} className="p-3 font-mono font-black text-base text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs active:scale-95">.</button>
          <button onClick={handleCalculate} className="p-3 font-black text-base text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl border border-indigo-500 transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center">=</button>
        </div>
      </div>
    </div>
  );
};
