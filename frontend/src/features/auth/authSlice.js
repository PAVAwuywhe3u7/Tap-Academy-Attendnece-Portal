import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginApi, meApi, registerApi } from '../../services/auth.api';

const TOKEN_KEY = 'tap_attendance_token';

export const registerUser = createAsyncThunk('auth/registerUser', async (payload) => registerApi(payload));

export const loginUser = createAsyncThunk('auth/loginUser', async (payload) => loginApi(payload));

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => meApi());

const getInitialToken = () => localStorage.getItem(TOKEN_KEY);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getInitialToken(),
    loading: false,
    initialized: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initialized = true;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initialized = true;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.token = null;
        state.error = action.error.message;
        localStorage.removeItem(TOKEN_KEY);
      });
  }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;