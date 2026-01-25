"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import {
	TextField,
	Button,
	Typography,
	Paper,
	Box,
	Stack,
	Divider,
	Switch,
	FormControlLabel,
} from "@mui/material";

import {
	fillAgendaPdf,
	getNextSundayFormatted,
	isFirstSundayOfMonth,
} from "@/utils/fillAgendaPdf";

import { ProgramFormData } from "@/interfaces";

import { createFirestoreStore } from "@/lib/firebaseStore";

const agendaStore = createFirestoreStore();

const ProgramForm: React.FC = () => {
	const [isFastTestimonyMeeting, setIsFastTestimonyMeeting] =
		React.useState<boolean>(isFirstSundayOfMonth);
	const storeData = useSyncExternalStore(
		agendaStore.subscribe,
		agendaStore.getSnapshot,
		agendaStore.getServerSnapshot,
	);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isDirty },
	} = useForm<ProgramFormData>({
		defaultValues: storeData,
	});

	const formData = watch();

	const onSubmit = async (data: ProgramFormData) => {
		await agendaStore.updateData(data);

		await fillAgendaPdf(data, isFastTestimonyMeeting);
	};

	const renderField = (
		name: keyof ProgramFormData,
		label: string,
		disabled: boolean = false,
	) => (
		<TextField
			{...register(name)}
			label={label}
			fullWidth
			size="small"
			error={!!errors[name]}
			helperText={errors[name]?.message}
			slotProps={{ inputLabel: { shrink: true } }}
			disabled={disabled}
		/>
	);

	useEffect(() => {
		const hasData = Object.values(storeData).some((val) => val !== "");
		if (hasData && !isDirty) {
			reset(storeData as ProgramFormData);
		}
	}, [storeData, reset, isDirty]);

	useEffect(() => {
		if (!isDirty) return; // Don't sync if no changes were made by the user

		const delayDebounceFn = setTimeout(async () => {
			await agendaStore.updateData(formData);
		}, 800);

		return () => clearTimeout(delayDebounceFn);
	}, [formData, isDirty]);

	return (
		<Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h5" sx={{ fontWeight: "bold" }}>
					Agenda Sacramental
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Próximo domingo: <b>{getNextSundayFormatted()}</b>
				</Typography>
			</Box>

			<form onSubmit={handleSubmit(onSubmit)}>
				<FormControlLabel
					sx={{ mb: 2 }}
					control={
						<Switch
							checked={isFastTestimonyMeeting}
							onChange={(e) => {
								setIsFastTestimonyMeeting(e.target.checked);
							}}
						/>
					}
					label="Reunión de ayuno y testimonio"
				/>
				<Stack spacing={2}>
					<Typography variant="overline" color="primary" sx={{ mt: 1 }}>
						Liderazgo
					</Typography>
					{renderField("presiding", "Preside")}
					{renderField("conducting", "Dirige")}

					<Divider />

					<Typography variant="overline" color="primary">
						Música y Oraciones
					</Typography>
					{renderField("organist", "Pianista")}
					{renderField("chorister", "Director de Música")}
					{renderField("opening_hymn", "Himno de Apertura")}
					{renderField("invocation", "Primera Oración")}
					{renderField("sacrament_hymn", "Himno Sacramental")}

					<Divider />

					<Typography variant="overline" color="primary">
						Discursantes
					</Typography>
					{renderField("speaker1", "Discursante 1", isFastTestimonyMeeting)}
					{renderField("speaker2", "Discursante 2", isFastTestimonyMeeting)}
					{renderField(
						"intermediate_hymn",
						"Himno Especial",
						isFastTestimonyMeeting,
					)}
					{renderField("speaker3", "Discursante 3", isFastTestimonyMeeting)}
					{renderField("speaker4", "Discursante 4", isFastTestimonyMeeting)}
					<Divider />

					<Typography variant="overline" color="primary">
						Cierre
					</Typography>
					{renderField("closing_hymn", "Himno de Final")}
					{renderField("benediction", "Oración Final")}

					<Box sx={{ pt: 2 }}>
						<Button type="submit" variant="contained" fullWidth size="large">
							Generar Agenda
						</Button>
					</Box>
				</Stack>
			</form>
		</Paper>
	);
};

export default ProgramForm;
