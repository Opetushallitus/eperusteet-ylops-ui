export function removeItem(key: string) {
  localStorage.removeItem(key);
}

export function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  else {
    return null;
  }
}
