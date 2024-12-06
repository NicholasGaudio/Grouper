import React from "react";

//INSTRUCTIONS TO INTEGRATE IN PROJECT
// Go to the page you would like to display this component from:
// 1. Add the import: "import GroupInvitation from "@components/GroupInvitation";
// 2. Add the component to the JSX: <GroupInvitation />
// Return to this file
// 1. Fetch the group name and inviter name from the API
// 2. Set groupName and inviterName to the returned values


const groupName = "Cool Coders Club";
const inviterName = "Jon";

const GroupInvitation: React.FC = ({}) => {
	const handleAccept = () => {
		alert("You are now in " + groupName);
	};

	const handleDecline = () => {
		alert("You did not join " + groupName);
	};
	
	return (
		<div style={{
			position: "absolute",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			border: "1px solid #ccc",
			padding: "20px",
			borderRadius: "10px",
			maxWidth: "400px",
			margin: "20px auto",
			backgroundColor: "black",
			textAlign: "center",
			color: "white",
		}}>
			<h2 style={{
			fontWeight: "bold",
			margin: "20px auto",
			backgroundColor: "black",
			textAlign: "center",
			color: "white",
		}}>You've Been Invited!</h2>
			<p>
				<b>{inviterName}</b> has invited you to join <b>{groupName}</b>.
			</p>
			<div style={styles.buttonContainer}>
				<button style={styles.acceptButton} onClick={handleAccept}>
					Accept
				</button>
				<button style={styles.declineButton} onClick={handleDecline}>
					Decline
				</button>
			</div>
		</div>
	);
};

const styles = {
	container: {
		border: "1px solid #ccc",
		padding: "20px",
		borderRadius: "10px",
		maxWidth: "400px",
		margin: "20px auto",
		backgroundColor: "#f9f9f9",
		textAlign: "center" as "center",
	},
	header: {
		color: "#333",
	},
	buttonContainer: {
		marginTop: "20px",
		display: "flex",
		justifyContent: "space-around",
	},
	acceptButton: {
		backgroundColor: "#4CAF50",
		color: "white",
		padding: "10px 20px",
		border: "none",
		borderRadius: "5px",
		cursor: "pointer",
	},
	declineButton: {
		backgroundColor: "#f44336",
		color: "white",
		padding: "10px 20px",
		border: "none",
		borderRadius: "5px",
		cursor: "pointer",
	},
};

export default GroupInvitation;
