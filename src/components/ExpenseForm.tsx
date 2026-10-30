"use client";

import React, { useEffect, useId, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DevicesIcon from "@mui/icons-material/Devices";
import { toast } from "react-toastify";

import { ExpenseFormData, EXPENSE_CATEGORIES } from "@/interfaces";
import { fillExpensePdf } from "@/utils/fillExpensePdf";
import { LocalStore } from "@/lib/LocalStore";

dayjs.locale("es");

const getTodayISODate = () => {
	return dayjs().format("YYYY-MM-DD");
};

const INITIAL_EXPENSE_DATA: ExpenseFormData = {
	purpose_type: "reembolso",
	applicant_name: "",
	applicant_date: getTodayISODate(),
	payee_name: "",
	payee_address: "",
	reason: "",
	category1: "",
	category1_other: "",
	amount1: "",
	category2: "",
	category2_other: "",
	amount2: "",
	category3: "",
	category3_other: "",
	amount3: "",
	total: "$ 0",
	stake_president_signature: "",
	approval_date: "",
	caw_beneficiary: "",
	caw_identification: "",
	dta_beneficiary: "",
	dta_identification: "",
	dta_bank: "",
	dta_account_number: "",
	dta_account_type: "",
};

const parseAmount = (val?: string): number => {
	if (!val) return 0;
	const clean = String(val).replace(/[^0-9]/g, "");
	return clean ? parseInt(clean, 10) : 0;
};

const formatCurrency = (val: number): string => {
	if (!val || isNaN(val)) return "$ 0";
	return `$ ${val.toLocaleString("es-CO")}`;
};

const ExpenseForm: React.FC = () => {
	const refTimerDebounce = useRef<NodeJS.Timeout | null>(null);
	const purposeLabelId = useId();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		control,
		getValues,
		formState: { errors },
	} = useForm<ExpenseFormData>({
		defaultValues: INITIAL_EXPENSE_DATA,
	});

	// Load initial values from LocalStore on client mount after hydration
	useEffect(() => {
		const savedData = LocalStore.get<ExpenseFormData>("expense_form_data");
		if (savedData) {
			reset({
				...INITIAL_EXPENSE_DATA,
				...savedData,
				applicant_date: savedData.applicant_date || getTodayISODate(),
			});
		}
	}, [reset]);

	// Subscribe to changes for local auto-saving (without toast)
	useEffect(() => {
		const subscription = watch((value) => {
			if (refTimerDebounce.current) clearTimeout(refTimerDebounce.current);
			refTimerDebounce.current = setTimeout(() => {
				LocalStore.set("expense_form_data", value);
			}, 900);
		});

		return () => {
			subscription.unsubscribe();
			if (refTimerDebounce.current) clearTimeout(refTimerDebounce.current);
		};
	}, [watch]);

	// Auto-calculate non-editable Total when amounts change
	const amount1 = watch("amount1");
	const amount2 = watch("amount2");
	const amount3 = watch("amount3");

	useEffect(() => {
		const a1 = parseAmount(amount1);
		const a2 = parseAmount(amount2);
		const a3 = parseAmount(amount3);
		const sum = a1 + a2 + a3;

		setValue("total", formatCurrency(sum), { shouldDirty: true });
	}, [amount1, amount2, amount3, setValue]);

	const handleAmountBlur = (fieldName: "amount1" | "amount2" | "amount3") => (
		e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const raw = e.target.value;
		if (raw && raw.trim() !== "") {
			const parsed = parseAmount(raw);
			if (parsed > 0) {
				setValue(fieldName, formatCurrency(parsed), { shouldDirty: true });
			}
		}
	};

	// Watch categories to show/hide "Otros" text field
	const category1 = watch("category1");
	const category2 = watch("category2");
	const category3 = watch("category3");

	const onSubmit = async (data: ExpenseFormData) => {
		try {
			await fillExpensePdf(data);
			toast.success("¡Solicitud de gastos generada exitosamente!");
		} catch (error) {
			console.error("Error generating expense PDF:", error);
			toast.error("Ocurrió un error al generar el PDF de gastos");
		}
	};

	const handleCopyPayeeToBeneficiary = () => {
		const payee = getValues("payee_name");
		if (!payee) {
			toast.warn("Ingresa primero el nombre en 'Pagar a'");
			return;
		}
		setValue("caw_beneficiary", payee, { shouldDirty: true });
		setValue("dta_beneficiary", payee, { shouldDirty: true });
		toast.info("Nombre copiado a los campos de beneficiario");
	};

	const handleResetForm = () => {
		reset({
			...INITIAL_EXPENSE_DATA,
			applicant_date: getTodayISODate(),
		});
		LocalStore.remove("expense_form_data");
		toast.info("Formulario reiniciado");
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
			<Paper
				elevation={3}
				sx={{ p: 4, maxWidth: 650, mx: "auto", mt: 4, mb: 6 }}
			>
				<Box
					sx={{
						mb: 3,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
					}}
				>
					<div>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1.5,
								mb: 0.5,
							}}
						>
							<Typography variant="h5" sx={{ fontWeight: "bold" }}>
								Solicitud de Gastos
							</Typography>
							<Chip
								size="small"
								variant="outlined"
								icon={<DevicesIcon fontSize="small" />}
								label="Modo Local"
							/>
						</Box>
						<Typography variant="body2" color="text.secondary">
							Estaca Bogotá Colombia Kennedy &bull; Guardado solo en este
							dispositivo
						</Typography>
					</div>
					<Tooltip title="Limpiar formulario">
						<Button
							variant="outlined"
							size="small"
							color="secondary"
							startIcon={<RestartAltIcon />}
							onClick={handleResetForm}
						>
							Limpiar
						</Button>
					</Tooltip>
				</Box>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={2.5}>
						{/* 1. Tipo de Solicitud */}
						<Box
							sx={{
								p: 2,
								bgcolor: "action.hover",
								borderRadius: 1.5,
							}}
						>
							<FormControl component="fieldset">
								<FormLabel
									id={purposeLabelId}
									component="legend"
									sx={{
										fontWeight: "bold",
										fontSize: "0.85rem",
										mb: 0.5,
									}}
								>
									Propósito del gasto
								</FormLabel>
								<Controller
									name="purpose_type"
									control={control}
									render={({ field }) => (
										<RadioGroup
											row
											{...field}
											aria-labelledby={purposeLabelId}
										>
											<FormControlLabel
												value="reembolso"
												control={<Radio size="small" />}
												label="Reembolso"
											/>
											<FormControlLabel
												value="adelanto"
												control={<Radio size="small" />}
												label="Por adelantado"
											/>
										</RadioGroup>
									)}
								/>
							</FormControl>
						</Box>

						{/* 2. Solicitante */}
						<Typography variant="overline" color="primary" sx={{ mt: 1 }}>
							Solicitante
						</Typography>
						<TextField
							{...register("applicant_name")}
							label="Nombre del Solicitante"
							fullWidth
							size="small"
							error={!!errors.applicant_name}
							helperText={errors.applicant_name?.message}
							slotProps={{ inputLabel: { shrink: true } }}
						/>

						{/* Calendar Picker para Fecha del Solicitante */}
						<Controller
							name="applicant_date"
							control={control}
							render={({ field }) => (
								<DatePicker
									label="Fecha de la Solicitud"
									value={field.value ? dayjs(field.value) : null}
									onChange={(newDate: Dayjs | null) => {
										field.onChange(
											newDate && newDate.isValid()
												? newDate.format("YYYY-MM-DD")
												: "",
										);
									}}
									slotProps={{
										textField: {
											size: "small",
											fullWidth: true,
											slotProps: { inputLabel: { shrink: true } },
										},
									}}
								/>
							)}
						/>

						<Divider />

						{/* 3. Pagar a */}
						<Typography variant="overline" color="primary">
							Pagar a
						</Typography>
						<TextField
							{...register("payee_name")}
							label="Nombre de a quien pagar"
							fullWidth
							size="small"
							error={!!errors.payee_name}
							helperText={errors.payee_name?.message}
							slotProps={{ inputLabel: { shrink: true } }}
						/>
						<TextField
							{...register("payee_address")}
							label="Dirección"
							fullWidth
							size="small"
							slotProps={{ inputLabel: { shrink: true } }}
						/>

						<Divider />

						{/* 4. Propósito del Gasto */}
						<Typography variant="overline" color="primary">
							Propósito del Gasto y Categorías
						</Typography>
						<TextField
							{...register("reason")}
							label="Razón o descripción del gasto"
							fullWidth
							multiline
							rows={2}
							size="small"
							slotProps={{ inputLabel: { shrink: true } }}
						/>

						{/* Fila Categoría 1 */}
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
							<Box sx={{ display: "flex", gap: 1.5 }}>
								<Controller
									name="category1"
									control={control}
									render={({ field }) => (
										<TextField
											select
											{...field}
											label="Categoría 1"
											size="small"
											sx={{ flex: 1.8 }}
											slotProps={{ inputLabel: { shrink: true } }}
										>
											<MenuItem value="">
												<em>-- Selecciona una categoría --</em>
											</MenuItem>
											{EXPENSE_CATEGORIES.map((cat) => (
												<MenuItem key={cat} value={cat}>
													{cat}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<TextField
									{...register("amount1")}
									onBlur={handleAmountBlur("amount1")}
									label="Cantidad 1"
									sx={{ flex: 1.2 }}
									size="small"
									placeholder="$ 0"
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							</Box>
							{category1 === "Otros" && (
								<TextField
									{...register("category1_other")}
									label="Especificar otra categoría 1"
									placeholder="Describe la categoría..."
									size="small"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							)}
						</Box>

						{/* Fila Categoría 2 */}
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
							<Box sx={{ display: "flex", gap: 1.5 }}>
								<Controller
									name="category2"
									control={control}
									render={({ field }) => (
										<TextField
											select
											{...field}
											label="Categoría 2 (Opcional)"
											size="small"
											sx={{ flex: 1.8 }}
											slotProps={{ inputLabel: { shrink: true } }}
										>
											<MenuItem value="">
												<em>-- Selecciona una categoría --</em>
											</MenuItem>
											{EXPENSE_CATEGORIES.map((cat) => (
												<MenuItem key={cat} value={cat}>
													{cat}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<TextField
									{...register("amount2")}
									onBlur={handleAmountBlur("amount2")}
									label="Cantidad 2"
									sx={{ flex: 1.2 }}
									size="small"
									placeholder="$ 0"
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							</Box>
							{category2 === "Otros" && (
								<TextField
									{...register("category2_other")}
									label="Especificar otra categoría 2"
									placeholder="Describe la categoría..."
									size="small"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							)}
						</Box>

						{/* Fila Categoría 3 */}
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
							<Box sx={{ display: "flex", gap: 1.5 }}>
								<Controller
									name="category3"
									control={control}
									render={({ field }) => (
										<TextField
											select
											{...field}
											label="Categoría 3 (Opcional)"
											size="small"
											sx={{ flex: 1.8 }}
											slotProps={{ inputLabel: { shrink: true } }}
										>
											<MenuItem value="">
												<em>-- Selecciona una categoría --</em>
											</MenuItem>
											{EXPENSE_CATEGORIES.map((cat) => (
												<MenuItem key={cat} value={cat}>
													{cat}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<TextField
									{...register("amount3")}
									onBlur={handleAmountBlur("amount3")}
									label="Cantidad 3"
									sx={{ flex: 1.2 }}
									size="small"
									placeholder="$ 0"
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							</Box>
							{category3 === "Otros" && (
								<TextField
									{...register("category3_other")}
									label="Especificar otra categoría 3"
									placeholder="Describe la categoría..."
									size="small"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
								/>
							)}
						</Box>

						{/* Total: Campo NO editable que suma todas las cantidades */}
						<TextField
							{...register("total")}
							label="Total"
							fullWidth
							size="small"
							placeholder="$ 0"
							slotProps={{
								inputLabel: { shrink: true },
								input: {
									readOnly: true,
									sx: {
										fontWeight: "bold",
										bgcolor: "action.hover",
										cursor: "default",
									},
								},
							}}
							helperText="Suma calculada automáticamente de todas las cantidades ingresadas (no editable)"
						/>

						<Divider />

						{/* 5. Para uso exclusivo del secretario */}
						<Typography variant="overline" color="primary">
							Para uso exclusivo del Secretario
						</Typography>
						<TextField
							{...register("stake_president_signature")}
							label="Firma / Nombre Presidente de Estaca (Opcional)"
							fullWidth
							size="small"
							slotProps={{ inputLabel: { shrink: true } }}
						/>

						{/* Calendar Picker para Fecha de Aprobación */}
						<Controller
							name="approval_date"
							control={control}
							render={({ field }) => (
								<DatePicker
									label="Fecha de Aprobación (Opcional)"
									value={field.value ? dayjs(field.value) : null}
									onChange={(newDate: Dayjs | null) => {
										field.onChange(
											newDate && newDate.isValid()
												? newDate.format("YYYY-MM-DD")
												: "",
										);
									}}
									slotProps={{
										textField: {
											size: "small",
											fullWidth: true,
											slotProps: { inputLabel: { shrink: true } },
										},
									}}
								/>
							)}
						/>

						<Divider />

						{/* 6. Información Bancaria */}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="overline" color="primary">
								Información Bancaria
							</Typography>
							<Button
								size="small"
								startIcon={<ContentCopyIcon />}
								onClick={handleCopyPayeeToBeneficiary}
							>
								Copiar de &apos;Pagar a&apos;
							</Button>
						</Box>

						{/* CAW */}
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontWeight: "bold" }}
						>
							COL BANCO DE OCCIDENTE CAW (Cheque / Efectivo)
						</Typography>
						<Box sx={{ display: "flex", gap: 1.5 }}>
							<TextField
								{...register("caw_beneficiary")}
								label="Beneficiario (CAW)"
								sx={{ flex: 1.5 }}
								size="small"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								{...register("caw_identification")}
								label="No. Identificación (CAW)"
								sx={{ flex: 1 }}
								size="small"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
						</Box>

						{/* DTA */}
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontWeight: "bold", mt: 1 }}
						>
							COL BANCO DE OCCIDENTE DTA (Transferencia Electrónica)
						</Typography>
						<Box sx={{ display: "flex", gap: 1.5 }}>
							<TextField
								{...register("dta_beneficiary")}
								label="Beneficiario (DTA)"
								sx={{ flex: 1.5 }}
								size="small"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								{...register("dta_identification")}
								label="No. Identificación (DTA)"
								sx={{ flex: 1 }}
								size="small"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
						</Box>
						<Box sx={{ display: "flex", gap: 1.5 }}>
							<TextField
								{...register("dta_bank")}
								label="Banco"
								sx={{ flex: 1.5 }}
								size="small"
								placeholder="Ej: Bancolombia, Davivienda"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								{...register("dta_account_number")}
								label="Número de cuenta"
								sx={{ flex: 1.5 }}
								size="small"
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<Controller
								name="dta_account_type"
								control={control}
								render={({ field }) => (
									<TextField
										select
										{...field}
										value={field.value || ""}
										label="Tipo de cuenta"
										sx={{ flex: 1 }}
										size="small"
										slotProps={{ inputLabel: { shrink: true } }}
									>
										<MenuItem value="">
											<em>(Vacío)</em>
										</MenuItem>
										<MenuItem value="Ahorros">Ahorros</MenuItem>
										<MenuItem value="Corriente">Corriente</MenuItem>
									</TextField>
								)}
							/>
						</Box>

						<Box sx={{ pt: 3 }}>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								fullWidth
								size="large"
								startIcon={<PictureAsPdfIcon />}
								sx={{ py: 1.3, fontWeight: "bold", fontSize: "1rem" }}
							>
								Generar Solicitud de Gastos (PDF)
							</Button>
						</Box>
					</Stack>
				</form>
			</Paper>
		</LocalizationProvider>
	);
};

export default ExpenseForm;
