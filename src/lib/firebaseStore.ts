import {
	doc,
	onSnapshot,
	updateDoc,
	addDoc,
	collection,
} from "firebase/firestore";

import { ProgramFormData } from "@/interfaces";
import { db } from "@/lib/firebase";
import { LocalStore } from "@/lib/LocalStore";

const INITIAL_SERVER_SNAPSHOT: Partial<ProgramFormData> = {
	ward: "",
	hour: "",
	presiding: "",
	conducting: "",
	organist: "",
	chorister: "",
	opening_hymn: "",
	invocation: "",
	sacrament_hymn: "",
	priesthood_blessing: "",
	priesthood_distribution: "",
	speaker1: "",
	speaker2: "",
	intermediate_hymn: "",
	speaker3: "",
	speaker4: "",
	closing_hymn: "",
	benediction: "",
};

export const createFirestoreStore = () => {
	const wardNumber = LocalStore.get<string>("ward_number");
	const docId =
		wardNumber && String(wardNumber).trim()
			? "ward-" + String(wardNumber).trim()
			: "";
	const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || "";

	// When there is no unit number or no collection, operate locally via LocalStore
	if (!docId || !collectionName) {
		const localSaved =
			LocalStore.get<Partial<ProgramFormData>>("agenda_form_data");
		let localSnapshot: Partial<ProgramFormData> =
			localSaved || INITIAL_SERVER_SNAPSHOT;
		const localListeners = new Set<() => void>();

		return {
			subscribe: (callback: () => void) => {
				localListeners.add(callback);
				return () => {
					localListeners.delete(callback);
				};
			},
			getSnapshot: () => localSnapshot,
			getServerSnapshot: () => INITIAL_SERVER_SNAPSHOT,
			updateData: async (newData: ProgramFormData) => {
				localSnapshot = newData;
				LocalStore.set("agenda_form_data", newData);
				localListeners.forEach((l) => l());
				return true;
			},
			addData: async (data: ProgramFormData) => {
				localSnapshot = data;
				LocalStore.set("agenda_form_data", data);
				localListeners.forEach((l) => l());
				return true;
			},
		};
	}

	let snapshot: Partial<ProgramFormData> =
		LocalStore.get<Partial<ProgramFormData>>("agenda_form_data") ||
		INITIAL_SERVER_SNAPSHOT;
	const listeners = new Set<() => void>();

	const subscribe = (callback: () => void) => {
		if (!collectionName || !docId) {
			return () => {};
		}

		const docRef = doc(db, collectionName, docId);

		const unsubscribeFirestore = onSnapshot(
			docRef,
			(docSnap) => {
				if (docSnap.exists()) {
					snapshot = docSnap.data() as ProgramFormData;
					LocalStore.set("agenda_form_data", snapshot);
				}
				listeners.forEach((l) => l());
			},
			(error) => {
				console.warn("Firestore snapshot error:", error);
			},
		);

		listeners.add(callback);

		return () => {
			unsubscribeFirestore();
			listeners.delete(callback);
		};
	};

	const getSnapshot = () => snapshot;

	const getServerSnapshot = () => INITIAL_SERVER_SNAPSHOT;

	const updateData = async (newData: ProgramFormData) => {
		snapshot = newData;
		LocalStore.set("agenda_form_data", newData);

		if (collectionName && docId) {
			try {
				const docRef = doc(db, collectionName, docId);
				// We cast to any here because updateDoc is picky about custom interfaces
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await updateDoc(docRef, newData as any);
			} catch (error) {
				console.warn("Could not sync to Firestore, saved locally:", error);
			}
		}
	};

	const addData = async (data: ProgramFormData) => {
		LocalStore.set("agenda_form_data", data);
		if (!collectionName) {
			return true;
		}
		try {
			await addDoc(collection(db, collectionName), data);
			return true;
		} catch (error) {
			console.error("Error adding doc to Firestore:", error);
			return false;
		}
	};

	return { subscribe, getSnapshot, updateData, getServerSnapshot, addData };
};
