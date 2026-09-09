import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/restaurantApi';
import { asArray, normalizeCategory, normalizeMenuItem, unwrap } from '../../utils/normalize';

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async ({ Comid = '1' } = {}, { rejectWithValue }) => {
  try {
    return asArray(unwrap(await api.getCategories(Comid))).map(normalizeCategory);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load categories');
  }
});

export const fetchMenu = createAsyncThunk('menu/fetchMenu', async ({ Comid = '1', CategoryId = 0 } = {}, { rejectWithValue }) => {
  try {
    return asArray(unwrap(await api.getMenu({ Comid, CategoryId }))).map(normalizeMenuItem);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load menu');
  }
});

const slice = createSlice({
  name: 'menu',
  initialState: { categories: [], items: [], loading: false, error: null },
  reducers: { clearMenuError: state => { state.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMenu.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchMenu.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchMenu.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearMenuError } = slice.actions;
export default slice.reducer;
