export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";

// Action to handle login success
export const loginSuccess = (user, token) => {
	return {
		type: LOGIN_SUCCESS,
		payload: { user, token },
	};
};

export const setAccessToken = (token) => {
    return{
	type: "SET_ACCESS_TOKEN",
	payload: token,
};
};


// Action to handle logout
export const logout = () => {
	return {
		type: LOGOUT,
	};
};
