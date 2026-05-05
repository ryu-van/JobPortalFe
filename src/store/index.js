import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";
import notificationsReducer from "./notificationSlice";

export const store = configureStore({
    reducer: {
        user: useReducer,
        notifications: notificationsReducer,
    },
});
