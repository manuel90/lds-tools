import { useEffect, useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { fetchHymns, getHymnByNumber } from "@/utils/hymnsFetch";

import { Hymn } from "@/interfaces";
import { get } from "http";

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
	const [loading, setLoading] = useState(false);

	const hymn = getHymnByNumber(songNumber);
	const [value, setValue] = useState("");
	const defValue = `${songNumber} - ${hymn?.title}` || "";

	const handleOpen = () => {
		setOpen(true);
		const hymns = fetchHymns();
		setOptions([...hymns]);
	};

	const handleClose = () => {
		setOpen(false);
		setOptions([]);
	};

	useEffect(() => {
		if (songNumber) {
			const foundHymn = getHymnByNumber(songNumber);
			setValue(foundHymn?.songNumber || "");
		} else {
			setValue("");
		}
	}, [songNumber]);

	return (
		<div>
			<Autocomplete
				key={songNumber}
				open={open}
				disabled={disabled}
				onOpen={handleOpen}
				onClose={handleClose}
				value={getHymnByNumber(value)}
				isOptionEqualToValue={(option, value) => {
					return value ? option.songNumber === value.songNumber : false;
				}}
				getOptionLabel={(option) =>
					option ? `${option.songNumber} - ${option.title}` : ""
				}
				onChange={(_, newValue) => {
					const hymnVal = newValue?.songNumber || "";
					onChange(hymnVal);
					setValue(hymnVal);
				}}
				options={options}
				loading={loading}
				renderInput={(params) => (
					<TextField
						{...params}
						label={label}
						fullWidth
						size="small"
						slotProps={{
							inputLabel: { shrink: true },
							input: {
								...params.InputProps,
								endAdornment: (
									<>
										{loading ? (
											<CircularProgress color="inherit" size={20} />
										) : null}
										{params.InputProps.endAdornment}
									</>
								),
							},
						}}
					/>
				)}
			/>
		</div>
	);
};

export default InputHymn;
