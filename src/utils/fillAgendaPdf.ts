import { PDFDocument, StandardFonts } from "pdf-lib";

import { ProgramFormData } from "@/interfaces";

const WARD_NAME_POSITION = {
	x: 135,
	y: 715,
	size: 11,
};

const BLESSING_PRIESTHOOD_POSITION = {
	x: 215,
	y: 115,
	size: 11,
};

const DISTRIBUTE_PRIESTHOOD_POSITION = {
	x: 205,
	y: 90,
	size: 11,
};

const DATE_POSITION = {
	x: 355,
	y: 730,
	size: 11,
};

const HOUR_POSITION = {
	x: 355,
	y: 705,
	size: 11,
};

const PRESIDING_POSITION = {
	x: 105,
	y: 630,
	size: 11,
};

const CONDUCTING_POSITION = {
	x: 325,
	y: 630,
	size: 11,
};

const ORGANIST_POSITION = {
	x: 105,
	y: 605,
	size: 11,
};

const CHORISTER_POSITION = {
	x: 410,
	y: 605,
	size: 11,
};

const INVOCATION_POSITION = {
	x: 160,
	y: 400,
	size: 11,
};

const OPENING_HYMN_POSITION = {
	x: 160,
	y: 425,
	size: 11,
};

const SACRAMENT_HYMN_POSITION = {
	x: 195,
	y: 135,
	size: 11,
};

const SPEAKER1_POSITION = {
	x: 130,
	y: 745,
	size: 11,
};

const SPEAKER2_POSITION = {
	x: 130,
	y: 695,
	size: 11,
};

const INTERMEDIATE_HYMN_POSITION = {
	x: 155,
	y: 645,
	size: 11,
};

const SPEAKER3_POSITION = {
	x: 130,
	y: 620,
	size: 11,
};

const SPEAKER4_POSITION = {
	x: 130,
	y: 450,
	size: 11,
};

const CLOSING_HYMN_POSITION = {
	x: 135,
	y: 410,
	size: 11,
};

const BENEDICTION_POSITION = {
	x: 135,
	y: 390,
	size: 11,
};

export const fillAgendaPdf = async (
	data: ProgramFormData,
	isFastTestimonyMeeting: boolean,
) => {
	const pdfUrl = getAssetPath(
		isFastTestimonyMeeting ? "agenda_fast.pdf" : "agenda.pdf",
	);

	const res = await fetch(pdfUrl);
	const buffer = await res.arrayBuffer();

	const file = new File([buffer], "file.pdf", {
		type: res.headers.get("content-type") || undefined,
	});

	const bytes = await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(bytes);

	const page1 = pdfDoc.getPages()[0];
	const page2 = pdfDoc.getPages()[1];
	const font = await pdfDoc.embedFont(StandardFonts.Courier);

	// ==== DATE AND HOUR ====

	page1.drawText(getNextSundayFormatted(), { font, ...DATE_POSITION });
	page1.drawText(data.ward || "", { font, ...WARD_NAME_POSITION });
	page1.drawText(data.hour || "", { font, ...HOUR_POSITION });

	// ==== PARTICIPANTS ====
	page1.drawText(data.presiding || "", { font, ...PRESIDING_POSITION });
	page1.drawText(data.conducting || "", { font, ...CONDUCTING_POSITION });
	page1.drawText(data.organist || "", { font, ...ORGANIST_POSITION });
	page1.drawText(data.chorister || "", { font, ...CHORISTER_POSITION });
	page1.drawText(data.invocation || "", { font, ...INVOCATION_POSITION });
	page2.drawText(
		data.benediction || "",
		isFastTestimonyMeeting
			? { font, ...BENEDICTION_POSITION, y: BENEDICTION_POSITION.y + 25 }
			: { font, ...BENEDICTION_POSITION },
	);

	// ==== SACRAMENT ====
	page1.drawText(data.sacrament_hymn || "", {
		font,
		...SACRAMENT_HYMN_POSITION,
	});
	page1.drawText(data.priesthood_blessing || "", {
		font,
		...BLESSING_PRIESTHOOD_POSITION,
	});
	page1.drawText(data.priesthood_distribution || "", {
		font,
		...DISTRIBUTE_PRIESTHOOD_POSITION,
	});

	// ==== HYMNS ====
	page1.drawText(data.opening_hymn || "", { font, ...OPENING_HYMN_POSITION });
	if (!isFastTestimonyMeeting) {
		page2.drawText(data.intermediate_hymn || "", {
			font,
			...INTERMEDIATE_HYMN_POSITION,
		});
	}
	page2.drawText(
		data.closing_hymn || "",
		isFastTestimonyMeeting
			? { font, ...CLOSING_HYMN_POSITION, y: CLOSING_HYMN_POSITION.y + 25 }
			: { font, ...CLOSING_HYMN_POSITION },
	);

	if (!isFastTestimonyMeeting) {
		// ==== SPEAKERS ====
		page2.drawText(data.speaker1 || "", { font, ...SPEAKER1_POSITION });
		page2.drawText(data.speaker2 || "", { font, ...SPEAKER2_POSITION });
		page2.drawText(data.speaker3 || "", { font, ...SPEAKER3_POSITION });
		page2.drawText(data.speaker4 || "", { font, ...SPEAKER4_POSITION });
	}
	const pdfBytes = await pdfDoc.save();
	const uint8PdfBytes = new Uint8Array(pdfBytes as unknown as ArrayBuffer);
	const blob = new Blob([uint8PdfBytes], { type: "application/pdf" });

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `agenda-editada__${getNextSundayFormatted().replace(/ /g, "_")}.pdf`;
	link.click();
};

export function getNextSundayFormatted() {
	const nextCalendarSunday = new Date();

	const day = nextCalendarSunday.getDay(); // 0 = Sunday
	const daysToAdd = day === 0 ? 0 : 7 - day;

	nextCalendarSunday.setDate(nextCalendarSunday.getDate() + daysToAdd);
	const options: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "long",
		year: "numeric",
	};
	const formattedDate = nextCalendarSunday.toLocaleDateString("es-ES", options);
	return formattedDate;
}

export function getAssetPath(path: string) {
	const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
	return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function isNextSundayFirstOfMonth() {
	const nextCalendarSunday = new Date();

	const day = nextCalendarSunday.getDay(); // 0 = Sunday
	const daysToAdd = day === 0 ? 0 : 7 - day;

	nextCalendarSunday.setDate(nextCalendarSunday.getDate() + daysToAdd);
	return nextCalendarSunday.getDate() === 1;
}
