import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tableReducer from './slices/tableSlice';
import menuReducer from './slices/menuSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: { auth: authReducer, tables: tableReducer, menu: menuReducer, orders: orderReducer, cart: cartReducer },
});

// Keep the cart available after a page refresh without putting localStorage
// side effects inside Redux reducers.
store.subscribe(() => {
  try {
    localStorage.setItem('customerCart', JSON.stringify(store.getState().cart.items));
  } catch {
    // Ignore storage errors (for example private browsing/storage limits).
  }
});
