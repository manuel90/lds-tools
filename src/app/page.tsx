"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Container from "@mui/material/Container";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import ProgramForm from "@/components/ProgramForm";
import ExpenseForm from "@/components/ExpenseForm";

export default function Home() {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	return (
		<Container maxWidth="md" sx={{ py: 3 }}>
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					variant="fullWidth"
					aria-label="formularios de herramientas de la estaca"
					sx={{
						"& .MuiTab-root": {
							fontWeight: "bold",
							fontSize: "1rem",
							textTransform: "none",
							minHeight: 52,
						},
					}}
				>
					<Tab
						icon={<EventNoteIcon />}
						iconPosition="start"
						label="Agenda"
						id="tab-agenda"
						aria-controls="tabpanel-agenda"
					/>
					<Tab
						icon={<ReceiptLongIcon />}
						iconPosition="start"
						label="Gastos"
						id="tab-gastos"
						aria-controls="tabpanel-gastos"
					/>
				</Tabs>
			</Box>

			<Box
				role="tabpanel"
				hidden={activeTab !== 0}
				id="tabpanel-agenda"
				aria-labelledby="tab-agenda"
			>
				{activeTab === 0 && <ProgramForm />}
			</Box>

			<Box
				role="tabpanel"
				hidden={activeTab !== 1}
				id="tabpanel-gastos"
				aria-labelledby="tab-gastos"
			>
				{activeTab === 1 && <ExpenseForm />}
			</Box>
		</Container>
	);
}
