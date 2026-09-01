import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SettingsContext = createContext(null);

export const DEFAULTS = {
  conference_name: 'ICTL 2026',
  conference_subtitle: 'International Conference on Teaching and Learning',
  logo_url:
    'https://media.base44.com/images/public/69fdae0983a85702d2227a8c/a107637de_1UT-ICTL_logo_blue-1024x211.webp',
  theme_color: '#7e22ce',
  twibbon_url:
    'https://media.base44.com/images/public/69fdae0983a85702d2227a8c/d9e29f14b_twibbone-ictl2026.png'
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    base44.entities.Setting.list()
      .then((rows) => {
        const map = {};
        rows.forEach((r) => {
          if (r.key) map[r.key] = r.value;
        });
        setSettings({ ...DEFAULTS, ...map });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.theme_color) {
      document.documentElement.style.setProperty('--brand', settings.theme_color);
    }
  }, [settings.theme_color]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext) || DEFAULTS;
}