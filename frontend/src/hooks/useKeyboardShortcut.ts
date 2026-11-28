'use client';

import { useEffect } from 'react';

type KeyboardShortcutOptions = {
  ctrlOrMeta?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  key: string,
  onShortcut: () => void,
  { ctrlOrMeta = false, preventDefault = false }: KeyboardShortcutOptions = {},
) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (ctrlOrMeta && !event.ctrlKey && !event.metaKey) return;
      if (preventDefault) event.preventDefault();
      onShortcut();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key, onShortcut, ctrlOrMeta, preventDefault]);
}
