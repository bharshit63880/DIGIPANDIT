import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

const savedToken = localStorage.getItem("digipandit_token");
const savedUser = localStorage.getItem("digipandit_user");

const initialState = {
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk("auth/login", async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
});

export const registerUser = createAsyncThunk("auth/register", async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data.data;
});

export const fetchCurrentUser = createAsyncThunk("auth/me", async () => {
  const response = await api.get("/users/me");
  return response.data.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("digipandit_token");
      localStorage.removeItem("digipandit_user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("digipandit_token", action.payload.token);
        localStorage.setItem("digipandit_user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("digipandit_token", action.payload.token);
        localStorage.setItem("digipandit_user", JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("digipandit_user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem("digipandit_token");
        localStorage.removeItem("digipandit_user");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
