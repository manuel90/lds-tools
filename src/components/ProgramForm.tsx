"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";

import { Id, toast } from "react-toastify";

import {
	fillAgendaPdf,
	getNextSundayFormatted,
	isNextSundayFirstOfMonth,
} from "@/utils/fillAgendaPdf";

import { ProgramFormData } from "@/interfaces";

import { createFirestoreStore } from "@/lib/firebaseStore";

import ModalEnterWardNumber from "./ModalEnterWardNumber";
import { LocalStore } from "@/lib/LocalStore";
import InputHymn from "./InputHymn";

const agendaStore = createFirestoreStore();

const ProgramForm: React.FC = () => {
	const [isFastTestimonyMeeting, setIsFastTestimonyMeeting] =
		React.useState<boolean>(isNextSundayFirstOfMonth());
	const [modalKey, setModalKey] = React.useState<number>(0);
	const refToastId = React.useRef<Id>("");
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
		setValue,
		trigger,
		formState: { errors, isDirty },
	} = useForm<ProgramFormData>({
		defaultValues: storeData,
	});

	const refTimerAlert = React.useRef<NodeJS.Timeout | null>(null);

	const formData = watch();

	const onChangeModalKey = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) => {
		e.preventDefault();
		LocalStore.set("ward_number", "");
		setModalKey((prevKey) => prevKey + 1);
		toast.dismiss(refToastId.current);
	};

	const onSubmit = async (data: ProgramFormData) => {
		try {
			await agendaStore.updateData(data);

			await fillAgendaPdf(data, isFastTestimonyMeeting);
		} catch (error) {
			refToastId.current = toast.error(
				<p>
					Número de unidad no válido.{" "}
					<a href="#" onClick={onChangeModalKey}>
						Cambiar
					</a>
				</p>,
			);
		}
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

	const renderHymnField = (name: keyof ProgramFormData, label: string) => (
		<InputHymn
			label={label}
			songNumber={formData[name] || ""}
			onChange={(newSongNumber) => {
				setValue(name, newSongNumber || "", { shouldDirty: true });
				trigger([name]);
			}}
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
			try {
				if (refTimerAlert.current) {
					clearTimeout(refTimerAlert.current);
				}
				await agendaStore.updateData(formData);
				refTimerAlert.current = setTimeout(() => {
					toast.info("Cambios guardados automáticamente");
				}, 5000);
			} catch (error) {}
		}, 900);

		return () => {
			clearTimeout(delayDebounceFn);
			if (refTimerAlert.current) {
				clearTimeout(refTimerAlert.current);
			}
		};
	}, [formData, isDirty]);

	return (
		<>
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
						{renderField("ward", "Barrio")}
						{renderField("hour", "Hora")}
						{renderField("presiding", "Preside")}
						{renderField("conducting", "Dirige")}

						<Divider />

						<Typography variant="overline" color="primary">
							Música y Oraciones
						</Typography>
						{renderField("organist", "Pianista")}
						{renderField("chorister", "Director de Música")}
						{renderHymnField("opening_hymn", "Himno de Apertura")}
						{renderField("invocation", "Primera Oración")}

						<Divider />

						<Typography variant="overline" color="primary">
							Santa Cena
						</Typography>
						{renderHymnField("sacrament_hymn", "Himno Sacramental")}
						{renderField("priesthood_blessing", "Bendición de la Santa Cena")}
						{renderField("priesthood_distribution", "Reparto de la Santa Cena")}

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
						{renderHymnField("closing_hymn", "Himno de Final")}
						{renderField("benediction", "Oración Final")}

						<Box sx={{ pt: 2 }}>
							<Button type="submit" variant="contained" fullWidth size="large">
								Generar Agenda
							</Button>
						</Box>
					</Stack>
				</form>
			</Paper>
			<ModalEnterWardNumber key={modalKey} />
		</>
	);
};

export default ProgramForm;
