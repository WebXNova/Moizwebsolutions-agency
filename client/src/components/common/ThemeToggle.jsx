import { useTheme } from '@/hooks/useTheme';
import { MonitorIcon, MoonIcon, SunIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

const OPTIONS = /** @type {const} */ ([
  { value: 'light', label: 'Light mode', Icon: SunIcon },
  { value: 'system', label: 'System theme', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark mode', Icon: MoonIcon },
]);

/**
 * Segmented theme switcher: light, system, and dark.
 */
export function ThemeToggle({ className }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        'inline-flex items-center rounded-full border border-border-subtle bg-surface-muted p-0.5 shadow-sm',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = preference === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setPreference(value)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              isActive
                ? 'bg-surface-elevated text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
