const KEY = "onboardingDraft";

export function loadOnboardingDraft() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearOnboardingDraft() {
  sessionStorage.removeItem(KEY);
}
