import {
	doc,
	onSnapshot,
	updateDoc,
	Firestore,
	addDoc,
	collection,
} from "firebase/firestore";

import { ProgramFormData } from "@/interfaces";
import { db } from "@/lib/firebase";

const INITIAL_SERVER_SNAPSHOT: Partial<ProgramFormData> = {
	presiding: "",
	conducting: "",
	organist: "",
	chorister: "",
	opening_hymn: "",
	invocation: "",
	sacrament_hymn: "",
	speaker1: "",
	speaker2: "",
	intermediate_hymn: "",
	speaker3: "",
	speaker4: "",
	closing_hymn: "",
	benediction: "",
};

export const createFirestoreStore = () => {
	const docId = process.env.NEXT_PUBLIC_DOC_ID || "";
	const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || "";

	let snapshot: Partial<ProgramFormData> = INITIAL_SERVER_SNAPSHOT;
	const listeners = new Set<() => void>();

	const subscribe = (callback: () => void) => {
		const docRef = doc(db, collectionName, docId);

		const unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
			if (docSnap.exists()) {
				snapshot = docSnap.data() as ProgramFormData;
			}
			listeners.forEach((l) => l());
		});

		listeners.add(callback);

		return () => {
			unsubscribeFirestore();
			listeners.delete(callback);
		};
	};

	const getSnapshot = () => snapshot;

	const getServerSnapshot = () => INITIAL_SERVER_SNAPSHOT;

	const updateData = async (newData: ProgramFormData) => {
		try {
			const docRef = doc(db, collectionName, docId);
			// We cast to any here because updateDoc is picky about custom interfaces
			await updateDoc(docRef, newData as any);
			return true;
		} catch (error) {
			console.error("Error updating document:", error);
			return false;
		}
	};

	const addData = async (data: ProgramFormData) => {
		try {
			await addDoc(
				collection(db, process.env.NEXT_PUBLIC_COLLECTION_NAME || ""),
				data,
			);
			return true;
		} catch (error) {
			console.error("Error:", error);
			return false;
		}
	};

	return { subscribe, getSnapshot, updateData, getServerSnapshot, addData };
};
