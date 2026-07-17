import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A search input that starts collapsed to just a magnifying-glass icon.
 * Clicking the icon expands it to its full size so the user can type;
 * it collapses again once it loses focus and is empty.
 */
export function SearchBox({ value, onChange, placeholder = 'Search...', className = '' }: SearchBoxProps) {
  const [expanded, setExpanded] = useState(Boolean(value));
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded((wasExpanded) => (value.trim() ? wasExpanded : false));
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [value]);

  function openSearch() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeSearch() {
    onChange('');
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <div ref={ref}>
        <button
          onClick={openSearch}
          aria-label="Open search"
          className={`w-9 h-9 rounded-xl flex items-center justify-center search-bar ${className}`}
        >
          <Search size={16} style={{ color: 'var(--ink-soft)' }} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex items-center gap-2 rounded-xl px-3 py-2 search-bar max-w-sm ${className}`}>
      <Search size={15} style={{ color: 'var(--ink-soft)' }} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm w-full"
        style={{ color: 'var(--ink)' }}
      />
      <button onClick={closeSearch} aria-label="Close search">
        <X size={14} style={{ color: 'var(--ink-soft)' }} />
      </button>
    </div>
  );
}
