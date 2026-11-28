import type { AuthState, AuthUser } from '@/types/auth';

export function createAuthSession() {
  const initial: AuthState = { status: 'loading', accessToken: null, user: null, error: null };
  let state = initial;
  let revision = 0;
  const listeners = new Set<() => void>();
  function update(next: AuthState) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    getRevision: () => revision,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    begin() {
      revision += 1;
      update({ status: 'loading', accessToken: null, user: null, error: null });
      return revision;
    },
    setToken(accessToken: string, expected: number) {
      if (revision === expected) update({ ...state, accessToken });
    },
    authenticate(accessToken: string, user: AuthUser, expected: number) {
      if (revision === expected)
        update({ status: 'authenticated', accessToken, user, error: null });
    },
    clear(expected = revision) {
      if (expected !== revision) return;
      revision += 1;
      update({ status: 'anonymous', accessToken: null, user: null, error: null });
    },
    fail(message: string, expected: number) {
      if (revision === expected) update({ ...state, status: 'error', error: message });
    },
  };
}

export type AuthSession = ReturnType<typeof createAuthSession>;
