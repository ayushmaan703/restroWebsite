import { createSlice } from '@reduxjs/toolkit';

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('customerCart') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const getItemId = item => String(item?.id ?? item?.menuId ?? '');

const slice = createSlice({
  name: 'cart',
  initialState: { items: readCart() },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const id = getItemId(item);
      if (!id) return;

      const found = state.items.find(x => getItemId(x) === id);
      if (found) {
        found.qty = Number(found.qty || 0) + 1;
      } else {
        state.items.push({ ...item, id, qty: 1 });
      }
    },

    changeQty: (state, action) => {
      const { id, delta } = action.payload;
      const targetId = String(id);
      const index = state.items.findIndex(item => getItemId(item) === targetId);

      if (index === -1) return;

      const nextQty = Number(state.items[index].qty || 0) + Number(delta || 0);

      if (nextQty <= 0) {
        state.items.splice(index, 1);
      } else {
        state.items[index].qty = nextQty;
      }
    },

    removeFromCart: (state, action) => {
      const targetId = String(action.payload);
      state.items = state.items.filter(item => getItemId(item) !== targetId);
    },

    clearCart: state => {
      state.items = [];
    },
  },
});

export const { addToCart, changeQty, removeFromCart, clearCart } = slice.actions;
export default slice.reducer;
