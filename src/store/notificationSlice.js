import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications(state, action) {
            const sorted = [...action.payload].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            state.items = sorted;
            state.unreadCount = sorted.filter((n) => !n.isRead).length;
        },
        prependNotification(state, action) {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        markOneRead(state, action) {
            const item = state.items.find((n) => n.id === action.payload);
            if (item && !item.isRead) {
                item.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllRead(state) {
            state.items.forEach((n) => {
                n.isRead = true;
            });
            state.unreadCount = 0;
        },
        clearNotifications(state) {
            state.items = [];
            state.unreadCount = 0;
        },
    },
});

export const {
    setNotifications,
    prependNotification,
    markOneRead,
    markAllRead,
    clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
