import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { setAccessToken } from "../../store/actions/authActions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const clientId =
	"729706315006-ddst4b64ffgao0fn570bmlvh25239ogn.apps.googleusercontent.com";
const GoogleLoginLayout = () => {
	//const [accessToken, setAccessToken] = useState("");
    	 const dispatch = useDispatch();
         const navigate = useNavigate();

	// // Handle successful login with Google
	const handleLoginSuccess = async (response) => {
		const { credential } = response; // Google tokenId
		try {
			const res = await fetch("/api/auth/google", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ tokenId: credential }),
			});
			const data = await res.json();

			if (res.ok) {
				// Save the token in Redux state and localStorage
				dispatch(setAccessToken(data.token));
				localStorage.setItem("accessToken", data.token);
				// Redirect to file upload page
                navigate("/fileupload");
			} else {
				console.error(data.error);
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	// // Check if user is already logged in (via localStorage)
	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			dispatch(setAccessToken(token)); // Restore token to Redux store
		}
	}, [dispatch]);


	return (
		<GoogleOAuthProvider clientId={clientId}>
			<div>
				<h2>Login with Google</h2>
				<GoogleLogin
					onSuccess={(response) => {
                        handleLoginSuccess(response);
						const accessToken = response.credential; // Get the Google access token
						// Dispatch the access token to Redux store
						//setAccessToken(accessToken);
						console.log("Google Login Successful, Token: ", accessToken);
					}}
					onError={(error) => console.log("Login Failed: ", error)}
				/>
			</div>
		</GoogleOAuthProvider>
	);
}

export default GoogleLoginLayout