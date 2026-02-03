import hymns from "@/data/hymns.json";

import { Hymn } from "@/interfaces";

export function fetchHymns(search = ""): Hymn[] {
	if (!search) {
		return hymns.data;
	}
	const lowerSearch = search.toLowerCase();
	const filteredHymns = hymns.data.filter(
		(hymn) =>
			hymn.title.toLowerCase().includes(lowerSearch) ||
			hymn.songNumber.toString() === search,
	);
	return filteredHymns;
}

export function getHymnByNumber(songNumber: string): Hymn | null {
	if (!songNumber) {
		return null;
	}
	const hymn = hymns.data.find((hymn) => hymn.songNumber === songNumber);
	return hymn || null;
}
