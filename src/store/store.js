import { createStore } from "redux";
import rootReducer from "./reducer";
import authReducer from "./reducers/authReducer";

const store = createStore(
	authReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // For Redux DevTools
);

export default store;



