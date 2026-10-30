import { PDFDocument, StandardFonts } from "pdf-lib";
import { ExpenseFormData } from "@/interfaces";
import { getAssetPath } from "./fillAgendaPdf";

export function formatDateWithFullMonth(dateInput?: string): string {
	if (!dateInput) return "";

	let d: Date;
	const trimmed = dateInput.trim();
	if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
		const [y, m, dNum] = trimmed.split("-").map(Number);
		d = new Date(y, m - 1, dNum);
	} else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
		const [dNum, m, y] = trimmed.split("/").map(Number);
		d = new Date(y, m - 1, dNum);
	} else {
		d = new Date(trimmed);
	}

	if (isNaN(d.getTime())) {
		return dateInput;
	}

	// Full month name, e.g. "30 de octubre de 2026"
	return d.toLocaleDateString("es-ES", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export const formatAmountCurrency = (val?: string | number): string => {
	if (val === undefined || val === null) return "";
	const clean = String(val).replace(/[^0-9]/g, "");
	if (!clean) return "";
	const num = parseInt(clean, 10);
	return `$ ${num.toLocaleString("es-CO")}`;
};

const getCategoryLabel = (category?: string, other?: string): string => {
	if (!category) return "";
	if (category === "Otros" && other && other.trim()) {
		return other.trim();
	}
	return category;
};

export const fillExpensePdf = async (data: ExpenseFormData) => {
	const pdfUrl = getAssetPath("form_expenses_2026.pdf");

	const res = await fetch(pdfUrl);
	const buffer = await res.arrayBuffer();

	const file = new File([buffer], "file.pdf", {
		type: res.headers.get("content-type") || undefined,
	});

	const bytes = await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(bytes);

	const page = pdfDoc.getPages()[0];
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	// 1. Tipo de Solicitud (Checkbox)
	if (data.purpose_type === "reembolso") {
		page.drawText("X", { x: 551.5, y: 717.5, size: 10, font: fontBold });
	} else if (data.purpose_type === "adelanto") {
		page.drawText("X", { x: 551.5, y: 693.5, size: 10, font: fontBold });
	}

	// 2. Solicitante
	if (data.applicant_name) {
		page.drawText(data.applicant_name, { x: 55, y: 647, size: 10, font });
	}
	if (data.applicant_date) {
		const fullDate = formatDateWithFullMonth(data.applicant_date);
		page.drawText(fullDate, { x: 410, y: 647, size: 10, font });
	}

	// 3. Pagar a
	if (data.payee_name) {
		page.drawText(data.payee_name, { x: 60, y: 602, size: 10, font });
	}
	if (data.payee_address) {
		page.drawText(data.payee_address, { x: 60, y: 579, size: 10, font });
	}

	// 4. Propósito del gasto
	if (data.reason) {
		page.drawText(data.reason, { x: 50, y: 534, size: 10, font });
	}

	// Categorías y Cantidades (si es "Otros", imprimir el valor especificado)
	const cat1 = getCategoryLabel(data.category1, data.category1_other);
	if (cat1) {
		page.drawText(cat1, { x: 65, y: 511, size: 10, font });
	}
	if (data.amount1) {
		const formattedAmount1 = formatAmountCurrency(data.amount1);
		if (formattedAmount1) {
			page.drawText(formattedAmount1, { x: 425, y: 511, size: 10, font });
		}
	}

	const cat2 = getCategoryLabel(data.category2, data.category2_other);
	if (cat2) {
		page.drawText(cat2, { x: 65, y: 488, size: 10, font });
	}
	if (data.amount2) {
		const formattedAmount2 = formatAmountCurrency(data.amount2);
		if (formattedAmount2) {
			page.drawText(formattedAmount2, { x: 425, y: 488, size: 10, font });
		}
	}

	const cat3 = getCategoryLabel(data.category3, data.category3_other);
	if (cat3) {
		page.drawText(cat3, { x: 65, y: 466, size: 10, font });
	}
	if (data.amount3) {
		const formattedAmount3 = formatAmountCurrency(data.amount3);
		if (formattedAmount3) {
			page.drawText(formattedAmount3, { x: 425, y: 466, size: 10, font });
		}
	}

	// Total
	if (data.total) {
		const formattedTotal = formatAmountCurrency(data.total) || data.total;
		page.drawText(formattedTotal, { x: 425, y: 405, size: 10, font: fontBold });
	}

	// 5. Para uso exclusivo del secretario
	if (data.stake_president_signature) {
		page.drawText(data.stake_president_signature, {
			x: 30,
			y: 265,
			size: 10,
			font,
		});
	}
	if (data.approval_date) {
		const fullApprovalDate = formatDateWithFullMonth(data.approval_date);
		page.drawText(fullApprovalDate, { x: 410, y: 265, size: 10, font });
	}

	// 6. COL BANCO DE OCCIDENTE CAW
	if (data.caw_beneficiary) {
		page.drawText(data.caw_beneficiary, { x: 75, y: 151, size: 10, font });
	}
	if (data.caw_identification) {
		page.drawText(data.caw_identification, { x: 100, y: 128, size: 10, font });
	}

	// 7. COL BANCO DE OCCIDENTE DTA
	if (data.dta_beneficiary) {
		page.drawText(data.dta_beneficiary, { x: 380, y: 164, size: 10, font });
	}
	if (data.dta_identification) {
		page.drawText(data.dta_identification, { x: 410, y: 141, size: 10, font });
	}
	if (data.dta_bank) {
		page.drawText(data.dta_bank, { x: 350, y: 118, size: 10, font });
	}
	if (data.dta_account_number) {
		page.drawText(data.dta_account_number, { x: 410, y: 95, size: 10, font });
	}
	if (data.dta_account_type && data.dta_account_type.trim()) {
		page.drawText(data.dta_account_type.trim(), { x: 390, y: 72, size: 10, font });
	}

	// Generar y descargar el PDF
	const pdfBytes = await pdfDoc.save();
	const uint8PdfBytes = new Uint8Array(pdfBytes as unknown as ArrayBuffer);
	const blob = new Blob([uint8PdfBytes], { type: "application/pdf" });

	const rawName = (data.payee_name || data.applicant_name || "gasto")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]/gi, "_");

	const today = new Date().toISOString().split("T")[0];

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `solicitud-gastos__${rawName}__${today}.pdf`;
	link.click();
	URL.revokeObjectURL(link.href);
};
