import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import DevicesIcon from "@mui/icons-material/Devices";
import { toast } from "react-toastify";

import { LocalStore } from "@/lib/LocalStore";
import { useForm } from "react-hook-form";
import { WardNumberFormData } from "@/interfaces";

interface ModalEnterWardNumberProps {
	open?: boolean;
	onClose?: () => void;
}

const ModalEnterWardNumber: React.FC<ModalEnterWardNumberProps> = ({
	open: propOpen,
	onClose: propOnClose,
}) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = propOpen !== undefined;
	const isOpen = isControlled ? propOpen : internalOpen;

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<WardNumberFormData>({
		defaultValues: {
			ward_number: "",
		},
	});

	useEffect(() => {
		setValue("ward_number", LocalStore.get<string>("ward_number") || "");
	}, [isOpen, setValue]);

	useEffect(() => {
		if (!isControlled) {
			const ward = LocalStore.get<string>("ward_number");
			const dismissed = LocalStore.get<boolean>("ward_prompt_dismissed");
			if (!ward && !dismissed) {
				setInternalOpen(true);
			}
		}
	}, [isControlled]);

	const handleClose = () => {
		LocalStore.set("ward_prompt_dismissed", true);
		if (isControlled && propOnClose) {
			propOnClose();
		} else {
			setInternalOpen(false);
		}
	};

	const onSubmit = (data: WardNumberFormData) => {
		const rawValue = (data.ward_number || "").trim();
		const prevValue = (LocalStore.get<string>("ward_number") || "").trim();

		LocalStore.set("ward_number", rawValue);
		LocalStore.set("ward_prompt_dismissed", true);

		handleClose();

		if (rawValue !== prevValue) {
			window.location.reload();
		} else {
			if (rawValue) {
				toast.success(`Unidad #${rawValue} configurada`);
			} else {
				toast.info("Modo local activado");
			}
		}
	};

	const handleWorkLocally = () => {
		const prevValue = (LocalStore.get<string>("ward_number") || "").trim();
		LocalStore.set("ward_number", "");
		LocalStore.set("ward_prompt_dismissed", true);
		setValue("ward_number", "");

		handleClose();

		if (prevValue !== "") {
			window.location.reload();
		} else {
			toast.info(
				"Modo local activado: la agenda se guardará únicamente en este dispositivo.",
			);
		}
	};

	return (
		<Dialog onClose={handleClose} open={isOpen} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
				Número de Unidad
			</DialogTitle>
			<DialogContent>
				<DialogContentText sx={{ mb: 2.5, fontSize: "0.9rem" }}>
					Ingresa el número de tu unidad/barrio para sincronizar la agenda en
					tiempo real, o continúa en <b>modo local</b> para editar y generar
					agendas sin necesidad de un número de unidad.
				</DialogContentText>
				<form id="ward-number-form" onSubmit={handleSubmit(onSubmit)}>
					<TextField
						{...register("ward_number")}
						label="Número de unidad (Opcional)"
						placeholder="Ej: 123456"
						fullWidth
						size="medium"
						error={!!errors.ward_number}
						helperText={errors.ward_number?.message}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
				</form>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5, flexDirection: "column", gap: 1 }}>
				<Button
					type="submit"
					form="ward-number-form"
					variant="contained"
					fullWidth
					startIcon={<CloudQueueIcon />}
					size="medium"
				>
					Guardar y sincronizar
				</Button>
				<Button
					type="button"
					variant="outlined"
					color="inherit"
					fullWidth
					startIcon={<DevicesIcon />}
					size="medium"
					onClick={handleWorkLocally}
				>
					Trabajar en modo local
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ModalEnterWardNumber;
