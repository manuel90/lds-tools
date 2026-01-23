"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { fillAgendaPdf, getNextSundayFormatted } from "../utils/fillAgendaPdf";

export default function AgendaForm() {
	const { register, handleSubmit } = useForm();

	const onSubmit = async (data: any) => {
		await fillAgendaPdf(data);
	};

	return (
		<div className="mx-auto max-w-[400px] w-full">
			<form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 500 }}>
				<h2 className="text-2xl font-bold mb-6">Agenda Dominical</h2>
				<p>Proximo domingo: {getNextSundayFormatted()}</p>

				<div className="mb-4">
					<label>Nombre</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("nombre")}
					/>
				</div>

				<div className="mb-4">
					<label>Preside</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("preside")}
					/>
				</div>
				<div className="mb-4">
					<label>Dirige</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("dirige")}
					/>
				</div>

				<div className="mb-4">
					<label>Himno Inicial</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("himnoInicial")}
					/>
				</div>

				<div className="mb-4">
					<label>Oración Inicial</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("oracionInicial")}
					/>
				</div>

				<div className="mb-4">
					<label>Discursante 1</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("discursante1")}
					/>
				</div>

				<div className="mb-4">
					<label>Discursante 2</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("discursante2")}
					/>
				</div>

				<div className="mb-4">
					<label>Discursante 3</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("discursante3")}
					/>
				</div>

				<div className="mb-4">
					<label>Discursante 4</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("discursante4")}
					/>
				</div>

				<div className="mb-4">
					<label>Himno Sacramental</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("himnoSacramental")}
					/>
				</div>

				<div className="mb-4">
					<label>Himno Especial</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("himnoEspecial")}
					/>
				</div>

				<div className="mb-4">
					<label>Himno Final</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("himnoFinal")}
					/>
				</div>

				<div className="mb-4">
					<label>Oración Final</label>
					<br />
					<input
						className="border-2 border-gray-300 rounded-md p-2 w-full"
						{...register("oracionFinal")}
					/>
				</div>

				<button
					className="cursor-pointer flex h-12 w-full max-w-[180px] items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
					type="submit"
				>
					Generar PDF
				</button>
			</form>
		</div>
	);
}
