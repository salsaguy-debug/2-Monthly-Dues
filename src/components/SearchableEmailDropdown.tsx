import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Mail, ChevronDown, X, Check, User } from 'lucide-react';

export interface DropdownOption {
  email: string;
  label: string;
  name?: string;
}

export interface SearchableEmailDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  language?: string;
  placeholder?: string;
  className?: string;
  allLabel?: string;
}

export const SearchableEmailDropdown: React.FC<SearchableEmailDropdownProps> = ({
  value,
  onChange,
  options,
  language = 'en',
  placeholder,
  className = '',
  allLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = useMemo(() => {
    if (!value || value === 'ALL') return null;
    return options.find(o => o.email.toLowerCase() === value.toLowerCase());
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter(
      o =>
        o.email.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        (o.name && o.name.toLowerCase().includes(q))
    );
  }, [options, query]);

  const defaultAllText = allLabel || (language === 'es' ? 'Todos los Integrantes / Emails' : 'All Performers / Emails');

  return (
    <div className={`relative ${className || 'flex-grow sm:flex-grow-0 sm:w-72'}`} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 pl-9 pr-8 py-2 text-xs font-bold bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-100/70 dark:hover:bg-slate-700/80 transition-all shadow-2xs"
      >
        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 pointer-events-none" />
        <span className="truncate">
          {value === 'ALL' || !value
            ? `📧 ${defaultAllText}`
            : selectedOption
            ? `👤 ${selectedOption.label}`
            : `👤 ${value}`}
        </span>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value !== 'ALL' && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('ALL');
              }}
              className="p-0.5 hover:bg-indigo-200/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-full transition-colors cursor-pointer"
              title={language === 'es' ? 'Limpiar filtro' : 'Clear filter'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100 min-w-[280px]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder || (language === 'es' ? 'Buscar email o integrante...' : 'Search email or performer...')}
              className="w-full pl-8 pr-7 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                onChange('ALL');
                setIsOpen(false);
                setQuery('');
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                value === 'ALL' || !value ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="truncate">📧 {defaultAllText}</span>
              {(value === 'ALL' || !value) && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
            </button>

            {filteredOptions.map((opt, idx) => {
              const isSelected = value.toLowerCase() === opt.email.toLowerCase();
              return (
                <button
                  key={`search-opt-${opt.email}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.email);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold truncate">{opt.label}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <p className="p-3 text-center text-xs text-slate-400 font-mono">
                {language === 'es' ? 'Sin coincidencias' : 'No matching performers/emails'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
