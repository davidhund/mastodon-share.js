/**
 * Try and read localstorage key value, returns -1 when unavailable
 * @param {string} key           localstorage key
 * @returns {string | null | -1} localstorage value
 */
export function readLocalStorage(key) {
	if (!key) {
		return null;
	}
	try {
		const val = localStorage.getItem(key);
		return val || null;
	} catch {
		console.warn(`LocalStorage: error reading '${key}'`);
		return -1;
	}
}

/**
 * Try and write localstorage key value, returns -1 when unavailable
 * @param {string} key           localstorage key
 * @param {string} val           localstorage value
 * @returns {string | null | -1} localstorage value
 */
export function writeLocalStorage(key, val) {
	if (!key || !val) {
		return null;
	}
	try {
		localStorage.setItem(key, val);
		return val || null;
	} catch {
		console.warn(`LocalStorage: error writing '${key}:${val}'`);
		return -1;
	}
}

/**
 * Try and delete localstorage key, returns -1 when unavailable
 * @param {string} key           localstorage key
 * @returns {string | null | -1} localstorage value
 */
export function deleteLocalStorage(key) {
	if (!key) {
		return null;
	}
	try {
		localStorage.removeItem(key);
		return key;
	} catch {
		console.warn(`LocalStorage: error deleting '${key}'`);
		return -1;
	}
}
