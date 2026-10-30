"use client";

import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useSyncExternalStore,
	type FC,
	type MouseEvent,
} from "react";
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
import Chip from "@mui/material/Chip";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import DevicesIcon from "@mui/icons-material/Devices";

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

const ProgramForm: FC = () => {
	const [mounted, setMounted] = useState<boolean>(false);
	const [isFastTestimonyMeeting, setIsFastTestimonyMeeting] =
		useState<boolean>(isNextSundayFirstOfMonth());
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [wardNumber, setWardNumber] = useState<string | null>(null);
	const refToastId = useRef<Id>("");
	const storeData = useSyncExternalStore(
		agendaStore.subscribe,
		agendaStore.getSnapshot,
		agendaStore.getServerSnapshot,
	);

	useEffect(() => {
		setMounted(true);
		const ward = LocalStore.get<string>("ward_number");
		setWardNumber(ward);
		const dismissed = LocalStore.get<boolean>("ward_prompt_dismissed");
		if (!ward && !dismissed) {
			setModalOpen(true);
		}
	}, []);

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

	const refTimerAlert = useRef<NodeJS.Timeout | null>(null);

	const formData = watch();

	const onChangeModalKey = useCallback(
		(e?: MouseEvent<HTMLElement>) => {
			e?.preventDefault();
			setModalOpen(true);
			toast.dismiss(refToastId.current);
		},
		[],
	);

	const onSubmit = async (data: ProgramFormData) => {
		try {
			await agendaStore.updateData(data);
			await fillAgendaPdf(data, isFastTestimonyMeeting);
			toast.success("¡Agenda generada exitosamente!");
		} catch (error) {
			console.error("Error generating agenda:", error);
			refToastId.current = toast.error(
				<p>
					Error al procesar la agenda.{" "}
					<a href="#" onClick={onChangeModalKey}>
						Configurar unidad
					</a>
				</p>,
			);
		}
	};

	const renderField = useCallback(
		(
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
		),
		[errors, register],
	);

	const renderHymnField = useCallback(
		(
			name: keyof ProgramFormData,
			label: string,
			disabled: boolean = false,
		) => (
			<InputHymn
				label={label}
				songNumber={formData[name] || ""}
				disabled={disabled}
				onChange={(newSongNumber) => {
					setValue(name, newSongNumber || "", { shouldDirty: true });
					trigger([name]);
				}}
			/>
		),
		[formData, setValue, trigger],
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
				// Only show auto-save notification when syncing with remote unit, not when saving locally
				if (wardNumber) {
					refTimerAlert.current = setTimeout(() => {
						toast.info("Cambios guardados automáticamente");
					}, 5000);
				}
			} catch (error) {}
		}, 900);

		return () => {
			clearTimeout(delayDebounceFn);
			if (refTimerAlert.current) {
				clearTimeout(refTimerAlert.current);
			}
		};
	}, [formData, isDirty, wardNumber]);

	return (
		<>
			<Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
				<Box sx={{ mb: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							mb: 0.5,
						}}
					>
						<Typography variant="h5" sx={{ fontWeight: "bold" }}>
							Agenda Sacramental
						</Typography>
						{mounted ? (
							<Chip
								size="small"
								color={wardNumber ? "primary" : "default"}
								variant="outlined"
								icon={
									wardNumber ? (
										<CloudDoneIcon fontSize="small" />
									) : (
										<DevicesIcon fontSize="small" />
									)
								}
								label={wardNumber ? `Unidad #${wardNumber}` : "Modo Local"}
								onClick={() => setModalOpen(true)}
								sx={{ cursor: "pointer", fontWeight: 500 }}
							/>
						) : (
							<Box sx={{ width: 115, height: 24 }} />
						)}
					</Box>
					<Typography variant="body2" color="text.secondary">
						Próximo domingo: <b suppressHydrationWarning>{getNextSundayFormatted()}</b>
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
						{renderHymnField(
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
			<ModalEnterWardNumber
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setWardNumber(LocalStore.get<string>("ward_number"));
				}}
			/>
		</>
	);
};

export default ProgramForm;
