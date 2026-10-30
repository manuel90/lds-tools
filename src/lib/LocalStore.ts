export class LocalStore {
	/**
	 * Saves data to localStorage.
	 * @param key The unique identifier for the data.
	 * @param value The data to store (will be stringified).
	 */
	static set<T>(key: string, value: T): void {
		if (typeof window === "undefined" || !window.localStorage) return;
		try {
			const serializedValue = JSON.stringify(value);
			localStorage.setItem(key, serializedValue);
		} catch (error) {
			console.error(`Error saving to localStorage: ${key}`, error);
		}
	}

	/**
	 * Retrieves and parses data from localStorage.
	 * @param key The identifier for the data.
	 * @returns The parsed data or null if not found.
	 */
	static get<T>(key: string): T | null {
		if (typeof window === "undefined" || !window.localStorage) return null;
		try {
			const serializedValue = localStorage.getItem(key);
			if (serializedValue === null) return null;
			return JSON.parse(serializedValue) as T;
		} catch (error) {
			console.error(`Error reading from localStorage: ${key}`, error);
			return null;
		}
	}

	/**
	 * Removes a specific item.
	 */
	static remove(key: string): void {
		if (typeof window === "undefined" || !window.localStorage) return;
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing from localStorage: ${key}`, error);
		}
	}

	/**
	 * Clears all data in localStorage.
	 */
	static clear(): void {
		if (typeof window === "undefined" || !window.localStorage) return;
		try {
			localStorage.clear();
		} catch (error) {
			console.error(`Error clearing localStorage`, error);
		}
	}
}
