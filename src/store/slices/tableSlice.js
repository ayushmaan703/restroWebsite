import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/restaurantApi';
import { asArray, normalizeTable, unwrap } from '../../utils/normalize';

export const fetchTableData = createAsyncThunk(
  'tables/fetchTableData',
  async ({ Comid = '1', SectionId = 0, FloorId = 0 } = {}, { rejectWithValue }) => {
    try {
      const [tablesRes, sectionsRes, floorsRes, countRes, todayRes] = await Promise.all([
        api.getTables({ Comid, SectionId, FloorId }),
        api.getSections(Comid),
        api.getFloors(Comid),
        api.getTableCount(Comid),
        api.getTodaysCount(Comid),
      ]);

      const count = asArray(unwrap(countRes))[0] || {};
      const today = asArray(unwrap(todayRes))[0] || {};

      return {
        tables: asArray(unwrap(tablesRes)).map(normalizeTable),
        sections: asArray(unwrap(sectionsRes)),
        floors: asArray(unwrap(floorsRes)),
        tableCount: Number(count.TotalTable || 0),
        availableCount: Number(count.AVAILABLE || 0),
        occupiedCount: Number(count.OCCUPIED || 0),
        notAvailableCount: Number(count.NOTAVAILABLE || 0),
        todaysOrder: Number(today.TodaysOrder || 0),
        todaysSale: Number(today.TodaysSale || 0),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load table data');
    }
  },
);

const slice = createSlice({
  name: 'tables',
  initialState: {
    loading: false,
    tables: [],
    sections: [],
    floors: [],
    tableCount: 0,
    availableCount: 0,
    occupiedCount: 0,
    notAvailableCount: 0,
    todaysOrder: 0,
    todaysSale: 0,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTableData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load tables';
      });
  },
});

export default slice.reducer;
