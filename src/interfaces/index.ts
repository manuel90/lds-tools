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
