import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--bg-elevated)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {theme === 'dark'
        ? <Sun size={20} className="transition-transform duration-300 hover:rotate-12" />
        : <Moon size={20} className="transition-transform duration-300 hover:-rotate-12" />
      }
    </button>
  );
}
