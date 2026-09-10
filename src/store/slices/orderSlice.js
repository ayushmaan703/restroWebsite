import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/restaurantApi';
import { asArray, normalizeOrderItem, normalizeOrderSummary, unwrap, value } from '../../utils/normalize';

export const fetchRunningOrders = createAsyncThunk('orders/fetchRunningOrders', async ({ Comid = '1' } = {}, { rejectWithValue }) => {
  try {
    return asArray(unwrap(await api.getTableOrders({ Comid, typ: 4 }))).map(normalizeOrderSummary);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load running orders');
  }
});

export const fetchCompletedOrders = createAsyncThunk('orders/fetchCompletedOrders', async ({ Comid = '1' } = {}, { rejectWithValue }) => {
  try {
    return asArray(unwrap(await api.getTableOrders({ Comid, typ: 5 }))).map(normalizeOrderSummary);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load completed orders');
  }
});

export const fetchOrderDetail = createAsyncThunk('orders/fetchOrderDetail', async ({ transid, Comid = '1' } = {}, { rejectWithValue }) => {
  try {
    const items = asArray(unwrap(await api.getOrderDetail({ transid, Comid }))).map(normalizeOrderItem);
    return items;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load order detail');
  }
});

export const fetchRunningOrderForTable = createAsyncThunk(
  'orders/fetchRunningOrderForTable',
  async ({ tableId, Comid = '1' } = {}, { rejectWithValue }) => {
    try {
      const summaries = asArray(unwrap(await api.getTableOrders({ Comid, typ: 4 }))).map(normalizeOrderSummary);
      const target = summaries.find(order => String(order.tableId) === String(tableId));

      if (!target?.transid) {
        return null;
      }

      const items = asArray(unwrap(await api.getOrderDetail({ transid: target.transid, Comid }))).map(normalizeOrderItem);
      return { ...target, items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unable to load current order');
    }
  },
);

export const deleteOrderItem = createAsyncThunk(
  'orders/deleteOrderItem',
  async ({ trans3id, Uid = 1, Comid = '1', transid } = {}, { rejectWithValue }) => {
    try {
      await api.deleteOrderEntry({ trans3id, Uid });

      const items = transid && String(transid) !== '0'
        ? asArray(unwrap(await api.getOrderDetail({ transid, Comid }))).map(normalizeOrderItem)
        : [];

      return { trans3id: String(trans3id), items };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unable to delete order item');
    }
  },
);

export const addOrderItem = createAsyncThunk('orders/addOrderItem', async ({ tableId, menuId, qty = 1, Comid = '1', Uid = 1, transid = 0, OrderNo = ',,' }, { rejectWithValue }) => {
  try {
    const response = await api.addOrder({ tableId, MenuId: menuId, Qty: qty, Comid, Uid, transid, OrderNo });
    const rows = asArray(unwrap(response));
    const first = rows[0] || {};
    const nextTransid = String(value(first, ['transId', 'transid', 'TransId', 'TransID'], transid));
    const nextOrderNo = String(value(first, ['OrderNo', 'OrderNumber', 'orderNo'], OrderNo));
    return { transid: nextTransid, OrderNo: nextOrderNo, response: rows };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Unable to add item');
  }
});

const slice = createSlice({
  name: 'orders',
  initialState: {
    running: [],
    completed: [],
    items: [],
    transid: '0',
    OrderNo: ',,',
    loading: false,
    adding: false,
    error: null,
    customerCurrentOrder: null,
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.transid = String(action.payload?.transid || '0');
      state.OrderNo = String(action.payload?.OrderNo || ',,');
      state.items = action.payload?.items || [];
      state.error = null;
    },
    decrementOrderItem: (state, action) => {
      const targetKey = String(action.payload);
      const item = state.items.find(item => String(item.key) === targetKey);
      if (!item) return;
      item.qty = Math.max(0, Number(item.qty || 0) - 1);
      if (item.qty === 0) {
        state.items = state.items.filter(item => String(item.key) !== targetKey);
      }
    },
    resetCurrentOrder: state => {
      state.items = [];
      state.transid = '0';
      state.OrderNo = ',,';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRunningOrders.pending, state => { state.loading = true; })
      .addCase(fetchRunningOrders.fulfilled, (state, action) => { state.loading = false; state.running = action.payload; })
      .addCase(fetchRunningOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCompletedOrders.pending, state => { state.loading = true; })
      .addCase(fetchCompletedOrders.fulfilled, (state, action) => { state.loading = false; state.completed = action.payload; })
      .addCase(fetchCompletedOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchOrderDetail.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchOrderDetail.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchRunningOrderForTable.pending, state => { state.error = null; })
      .addCase(fetchRunningOrderForTable.fulfilled, (state, action) => {
        state.customerCurrentOrder = action.payload;
      })
      .addCase(fetchRunningOrderForTable.rejected, (state, action) => {
        state.customerCurrentOrder = null;
        state.error = action.payload;
      })
      .addCase(deleteOrderItem.pending, state => { state.error = null; })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(deleteOrderItem.rejected, (state, action) => { state.error = action.payload; })
      .addCase(addOrderItem.pending, state => { state.adding = true; state.error = null; })
      .addCase(addOrderItem.fulfilled, (state, action) => {
        state.adding = false;
        state.transid = action.payload.transid;
        state.OrderNo = action.payload.OrderNo;
      })
      .addCase(addOrderItem.rejected, (state, action) => { state.adding = false; state.error = action.payload || 'Unable to add item'; });
  },
});

export const { setCurrentOrder, decrementOrderItem, resetCurrentOrder } = slice.actions;
export default slice.reducer;
