import { useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { fetchHymns, getHymnByNumber } from "@/utils/hymnsFetch";

import { Hymn } from "@/interfaces";

type InputHymnProps = {
	label: string;
	songNumber: string;
	disabled?: boolean;
	onChange: (newSongNumber: string) => void;
};

const InputHymn: React.FC<InputHymnProps> = ({
	label,
	songNumber,
	disabled = false,
	onChange,
}) => {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<Hymn[]>([]);

	const handleOpen = () => {
		setOpen(true);
		const hymns = fetchHymns();
		setOptions([...hymns]);
	};

	const handleClose = () => {
		setOpen(false);
		setOptions([]);
	};

	return (
		<div>
			<Autocomplete
				key={songNumber}
				open={open}
				disabled={disabled}
				onOpen={handleOpen}
				onClose={handleClose}
				value={getHymnByNumber(songNumber)}
				isOptionEqualToValue={(option, value) => {
					return value ? option.songNumber === value.songNumber : false;
				}}
				getOptionLabel={(option) =>
					option ? `${option.songNumber} - ${option.title}` : ""
				}
				onChange={(_, newValue) => {
					const hymnVal = newValue?.songNumber || "";
					onChange(hymnVal);
				}}
				options={options}
				renderInput={(params) => (
					<TextField
						{...params}
						label={label}
						fullWidth
						size="small"
						slotProps={{
							inputLabel: { shrink: true },
						}}
					/>
				)}
			/>
		</div>
	);
};

export default InputHymn;
