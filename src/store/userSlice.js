import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: undefined,
  token: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload.user;
      state.token = action.payload.token || null;
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  userSlice.actions;
export default userSlice.reducer;
