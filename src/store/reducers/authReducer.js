import { LOGIN_SUCCESS, LOGOUT } from "../actions/authActions";

const initialState = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
};

const authReducer = (state = initialState, action={}) => {
	switch (action.type) {
		case LOGIN_SUCCESS:
			return {
				...state,
				isAuthenticated: true,
				user: action.payload.user,
				accessToken: action.payload.token,
			};
		case "SET_ACCESS_TOKEN":
			console.log("Setting access token: ", action.payload);
			return {
				...state,
				accessToken: action.payload,
			};
		case LOGOUT:
			return {
				...state,
				isAuthenticated: false,
				user: null,
				accessToken: null,
			};
		default:
			return state;
	}
};

export default authReducer;
