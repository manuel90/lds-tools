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
} from "@mui/material";

import { fillAgendaPdf, getNextSundayFormatted } from "@/utils/fillAgendaPdf";

import { ProgramFormData } from "@/interfaces";

import { createFirestoreStore } from "@/lib/firebaseStore";

const agendaStore = createFirestoreStore();

const ProgramForm: React.FC = () => {
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

		await fillAgendaPdf(data);
	};

	const renderField = (name: keyof ProgramFormData, label: string) => (
		<TextField
			{...register(name)}
			label={label}
			fullWidth
			size="small"
			error={!!errors[name]}
			helperText={errors[name]?.message}
			slotProps={{ inputLabel: { shrink: true } }}
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
				{/* Stack replaces Grid and manages vertical spacing (spacing={2} = 16px) */}
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
					{renderField("speaker1", "Discursante 1")}
					{renderField("speaker2", "Discursante 2")}
					{renderField("intermediate_hymn", "Himno Especial")}
					{renderField("speaker3", "Discursante 3")}
					{renderField("speaker4", "Discursante 4")}

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
