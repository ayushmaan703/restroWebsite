import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/restaurantApi";
import {
  asArray,
  normalizeOrderItem,
  normalizeOrderSummary,
  unwrap,
  value,
} from "../../utils/normalize";

const mergeOrderItems = (items) => {
  const grouped = new Map();

  items.forEach((item) => {
    // GetOrderdetail currently does not return ItemId, so use the item name
    // as the fallback identity. This prevents repeated clicks on the same
    // menu item from appearing as separate rows in the waiter screen.
    const identity = String(item.menuId || item.name || item.key)
      .trim()
      .toLowerCase();
    const existing = grouped.get(identity);

    if (existing) {
      existing.qty += Number(item.qty || 0);
      existing.totalAmount += Number(item.price || 0);
      existing.totalPriceWithoutGst += Number(item.priceWithoutGst || 0);
      existing.totalGst += Number(item.gst || 0);
      existing.key = existing.menuId || existing.name;
    } else {
      grouped.set(identity, {
        ...item,
        key: item.menuId || item.name || item.key,
        qty: Number(item.qty || 0),
        totalAmount: Number(item.price || 0),
        totalPriceWithoutGst: Number(item.priceWithoutGst || 0),
        totalGst: Number(item.gst || 0),
      });
    }
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    price: item.qty ? item.totalAmount / item.qty : 0,
    priceWithoutGst: item.qty ? item.totalPriceWithoutGst / item.qty : 0,
    gst: item.qty ? item.totalGst / item.qty : 0,
  }));
};

export const fetchRunningOrders = createAsyncThunk(
  "orders/fetchRunningOrders",
  async ({ Comid = "1" } = {}, { rejectWithValue }) => {
    try {
      return asArray(unwrap(await api.getTableOrders({ Comid, typ: 4 }))).map(
        normalizeOrderSummary,
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to load running orders",
      );
    }
  },
);

export const fetchCompletedOrders = createAsyncThunk(
  "orders/fetchCompletedOrders",
  async ({ Comid = "1" } = {}, { rejectWithValue }) => {
    try {
      return asArray(unwrap(await api.getTableOrders({ Comid, typ: 5 }))).map(
        normalizeOrderSummary,
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to load completed orders",
      );
    }
  },
);

export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOrderDetail",
  async ({ transid, Comid = "1" } = {}, { rejectWithValue }) => {
    try {
      const items = asArray(
        unwrap(await api.getOrderDetail({ transid, Comid })),
      ).map(normalizeOrderItem);
      return mergeOrderItems(items);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to load order detail",
      );
    }
  },
);

export const addOrderItem = createAsyncThunk(
  "orders/addOrderItem",
  async (
    {
      tableId,
      menuId,
      qty = 1,
      Comid = "1",
      Uid = 1,
      transid = 0,
      OrderNo = ",,",
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.addOrder({
        tableId,
        MenuId: menuId,
        Qty: qty,
        Comid,
        Uid,
        transid,
        OrderNo,
      });
      const rows = asArray(unwrap(response));
      const first = rows[0] || {};
      const nextTransid = String(
        value(first, ["transId", "transid", "TransId", "TransID"], transid),
      );
      const nextOrderNo = String(
        value(first, ["OrderNo", "OrderNumber", "orderNo"], OrderNo),
      );
      return { transid: nextTransid, OrderNo: nextOrderNo, response: rows };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unable to add item",
      );
    }
  },
);

const slice = createSlice({
  name: "orders",
  initialState: {
    running: [],
    completed: [],
    items: [],
    transid: "0",
    OrderNo: ",,",
    loading: false,
    adding: false,
    error: null,
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.transid = String(action.payload?.transid || "0");
      state.OrderNo = String(action.payload?.OrderNo || ",,");
      state.items = action.payload?.items || [];
      state.error = null;
    },
    removeOrderItem: (state, action) => {
      const targetKey = String(action.payload);
      state.items = state.items.filter(
        (item) => String(item.key) !== targetKey,
      );
    },
    decrementOrderItem: (state, action) => {
      const targetKey = String(action.payload);
      const item = state.items.find((item) => String(item.key) === targetKey);
      if (!item) return;
      item.qty = Math.max(0, Number(item.qty || 0) - 1);
      if (item.qty === 0) {
        state.items = state.items.filter(
          (item) => String(item.key) !== targetKey,
        );
      }
    },
    resetCurrentOrder: (state) => {
      state.items = [];
      state.transid = "0";
      state.OrderNo = ",,";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRunningOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRunningOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.running = action.payload;
      })
      .addCase(fetchRunningOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompletedOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompletedOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.completed = action.payload;
      })
      .addCase(fetchCompletedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addOrderItem.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addOrderItem.fulfilled, (state, action) => {
        state.adding = false;
        state.transid = action.payload.transid;
        state.OrderNo = action.payload.OrderNo;
      })
      .addCase(addOrderItem.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload || "Unable to add item";
      });
  },
});

export const {
  setCurrentOrder,
  removeOrderItem,
  decrementOrderItem,
  resetCurrentOrder,
} = slice.actions;
export default slice.reducer;
