const PREFIX = "digipandit_hawan_progress_";

export const emptyHawanProgress = () => ({
  saved: false, completedStepIds: [], readyMaterialIds: [], currentStepIndex: 0,
  mantraCounts: {}, safetyConfirmedAt: null, startedAt: null, completedAt: null,
});

const safeParse = (value) => { try { return JSON.parse(value); } catch { return null; } };

export function loadLocalHawanProgress(hawanId) {
  if (!hawanId) return emptyHawanProgress();
  const stored = safeParse(localStorage.getItem(`${PREFIX}${hawanId}`));
  return stored ? { ...emptyHawanProgress(), ...stored } : emptyHawanProgress();
}

export function saveLocalHawanProgress(hawanId, progress, metadata = {}) {
  const value = { ...emptyHawanProgress(), ...progress, ...metadata, hawanId, updatedAt: new Date().toISOString() };
  localStorage.setItem(`${PREFIX}${hawanId}`, JSON.stringify(value));
  return value;
}

export function clearLocalHawanProgress(hawanId) { localStorage.removeItem(`${PREFIX}${hawanId}`); }

export function listLocalHawanProgress() {
  const items = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(PREFIX)) continue;
    const value = safeParse(localStorage.getItem(key));
    if (value) items.push(value);
  }
  return items.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

export function progressPayload(progress) {
  return {
    saved: Boolean(progress.saved), completedStepIds: progress.completedStepIds || [],
    readyMaterialIds: progress.readyMaterialIds || [], currentStepIndex: progress.currentStepIndex || 0,
    mantraCounts: progress.mantraCounts || {}, safetyConfirmed: Boolean(progress.safetyConfirmedAt),
    startedAt: progress.startedAt || undefined,
  };
}
