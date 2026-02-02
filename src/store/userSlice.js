import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: undefined,
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
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      state.userInfo = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  userSlice.actions;
export default userSlice.reducer;
