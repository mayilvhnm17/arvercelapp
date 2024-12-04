import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
	return (
		<div>
			<h2>Welcome to the AR App</h2>
			<p>Please log in to continue</p>
			<Link to="/login">Go to Login</Link>
		</div>
	);
};

export default HomePage;
