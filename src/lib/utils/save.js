import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import LZString from 'lz-string';

export function parseSave(saveString) {
	const jsonString = LZString.decompressFromBase64(saveString);
	return JSON.parse(jsonString);
}

const storedSaveString = browser && localStorage.saveString;
export const saveStore = writable(storedSaveString || '');
saveStore.subscribe((value) => {
	if (browser) return (localStorage.saveString = value);
});
