import notifyApi from "../api/notifyApi";
import { setNotifications, markOneRead, markAllRead, prependNotification, clearNotifications } from "./notificationSlice";
import * as webSocketService from "../services/webSocketService";

export const fetchNotifications = () => async (dispatch) => {
    try {
        const res = await notifyApi.getAll();
        dispatch(setNotifications(res.data?.data ?? []));
    } catch {
        dispatch(setNotifications([]));
    }
};

export const readNotification = (id, addToast) => async (dispatch) => {
    try {
        await notifyApi.markRead(id);
        dispatch(markOneRead(id));
    } catch {
        addToast?.("error", "Không thể đánh dấu thông báo đã đọc");
    }
};

export const readAllNotifications = (addToast) => async (dispatch) => {
    try {
        await notifyApi.markAllRead();
        dispatch(markAllRead());
    } catch {
        addToast?.("error", "Không thể đánh dấu tất cả thông báo đã đọc");
    }
};

export const initNotifications = () => async (dispatch) => {
    await dispatch(fetchNotifications());
    webSocketService.connect((notification) => {
        dispatch(prependNotification(notification));
    });
};

export const teardownNotifications = () => (dispatch) => {
    webSocketService.disconnect();
    dispatch(clearNotifications());
};
