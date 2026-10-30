export type ProgramFormData = {
	id?: string;
	ward: string;
	hour: string;
	presiding: string;
	conducting: string;
	organist: string;
	chorister: string;
	opening_hymn: string;
	invocation: string;
	sacrament_hymn: string;
	priesthood_blessing: string;
	priesthood_distribution: string;
	speaker1: string;
	speaker2: string;
	intermediate_hymn: string;
	speaker3: string;
	speaker4: string;
	closing_hymn: string;
	benediction: string;
};

export type WardNumberFormData = {
	ward_number: string;
};

export type Hymn = {
	title: string;
	songNumber: string;
};

export type ExpenseFormData = {
	id?: string;
	purpose_type: "reembolso" | "adelanto";
	applicant_name: string;
	applicant_date: string;
	payee_name: string;
	payee_address: string;
	reason: string;
	category1: string;
	category1_other?: string;
	amount1: string;
	category2: string;
	category2_other?: string;
	amount2: string;
	category3: string;
	category3_other?: string;
	amount3: string;
	total: string;
	stake_president_signature: string;
	approval_date: string;
	// COL BANCO DE OCCIDENTE CAW
	caw_beneficiary: string;
	caw_identification: string;
	// COL BANCO DE OCCIDENTE DTA
	dta_beneficiary: string;
	dta_identification: string;
	dta_bank: string;
	dta_account_number: string;
	dta_account_type: string;
};

export const EXPENSE_CATEGORIES: string[] = [
	"Quórum Élderes",
	"Grupo Sumos Sacerdotes",
	"Adultos Solteros",
	"Administración",
	"Currículo",
	"Centro de Distribución",
	"Misceláneo",
	"Hombres Jóvenes",
	"Mujeres Jóvenes",
	"Biblioteca",
	"Primaria",
	"Asignación de Presupuesto",
	"Sociedad de Socorro",
	"Escuela Dominical",
	"Centro de Historia Familiar",
	"Otros",
];
