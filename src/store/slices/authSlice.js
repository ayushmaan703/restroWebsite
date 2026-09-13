import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/restaurantApi";
import { asArray, unwrap } from "../../utils/normalize";

const saved = JSON.parse(localStorage.getItem("restaurantUser") || "null");
const initialState = {
  loading: false,
  status: saved ? "authenticated" : "unauthenticated",
  userData: saved,
  error: null,
  restroName: "",
};

export const userLogin = createAsyncThunk(
  "auth/userLogin",
  async ({ username, password, Comid = "1" }, { rejectWithValue }) => {
    try {
      const rows = asArray(
        unwrap(await api.login({ username, password, Comid })),
      );
      const user = rows[0];
      if (user.Status == "User not found")
        return rejectWithValue("Invalid user");

      const normalized = {
        ...user,
        Uid: String(user.UserId ?? user.Uid ?? user.UID ?? "1"),
        UserId: String(user.UserId ?? ""),
        Username: user.Username ?? username,
        Usertype: user.Usertype ?? "",
        Comid: String(Comid),
      };

      localStorage.setItem("restaurantUser", JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed",
      );
    }
  },
);

export const restroName = createAsyncThunk(
  "auth/restroName",
  async ({ Comid = "1" }, { rejectWithValue }) => {
    try {
      const name = await api.getRestroName({ Comid });
      
      return name.data[0].CompanyName;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.userData = null;
      state.status = "unauthenticated";
      localStorage.removeItem("restaurantUser");
    },
    setUser: (state, action) => {
      state.userData = action.payload.user;
      state.status = action.payload.auth?.status || "authenticated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "authenticated";
        state.userData = action.payload;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.status = "unauthenticated";
        state.userData = null;
        state.error = action.payload || "Login failed";
      })
      .addCase(restroName.pending, (state) => {
        state.loading = true;
      })
      .addCase(restroName.fulfilled, (state, action) => {
        state.loading = false;
        state.restroName = action.payload;
      })
      .addCase(restroName.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { logoutUser, setUser } = slice.actions;
export default slice.reducer;
