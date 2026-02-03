import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";

import { LocalStore } from "@/lib/LocalStore";
import { useForm } from "react-hook-form";
import { WardNumberFormData } from "@/interfaces";

const ModalEnterWardNumber: React.FC = () => {
	const [open, setOpen] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<WardNumberFormData>({
		defaultValues: {
			ward_number: LocalStore.get("ward_number") || "",
		},
	});

	const onSubmit = (data: WardNumberFormData) => {
		LocalStore.set("ward_number", data.ward_number);
		window.location.reload();
	};

	useEffect(() => {
		if (!LocalStore.get("ward_number")) {
			setOpen(true);
		}
	}, []);

	return (
		<Dialog onClose={() => setOpen(false)} open={open}>
			<DialogTitle>Ingresa el número de unidad</DialogTitle>
			<DialogContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<TextField
						{...register("ward_number")}
						fullWidth
						size="medium"
						error={!!errors.ward_number}
						helperText={errors.ward_number?.message}
					/>
					<Box sx={{ pt: 2 }}>
						<Button type="submit" variant="contained" fullWidth size="large">
							Guardar
						</Button>
					</Box>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ModalEnterWardNumber;
