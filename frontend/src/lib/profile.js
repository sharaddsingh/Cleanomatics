export const PROFILE_KEY = "taskly-name";

export function readProfileName() {
  try {
    return (localStorage.getItem(PROFILE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function writeProfileName(name) {
  localStorage.setItem(PROFILE_KEY, name);
}

export function firstName(name) {
  return name.trim().split(/\s+/)[0] || name.trim();
}

export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`;
  return (letters || name.trim().slice(0, 2)).toUpperCase();
}

export function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}
