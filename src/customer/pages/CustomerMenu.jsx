import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchMenu } from '../../store/slices/menuSlice';
import { fetchRunningOrderForTable } from '../../store/slices/orderSlice';
import { addToCart, changeQty, clearCart } from '../../store/slices/cartSlice';
import CustomerHeader from '../components/CustomerHeader';
import CategoryTabs from '../components/CategoryTabs';
import FoodCard from '../components/FoodCard';
import FloatingCart from '../components/FloatingCart';

export default function CustomerMenu() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const menu = useSelector(state => state.menu);
  const cart = useSelector(state => state.cart.items);
  const currentOrder = useSelector(state => state.orders.customerCurrentOrder);
  const [category, setCategory] = useState('0');
  const [search, setSearch] = useState('');

  const tableId =
    params.get('table') ||
    params.get('TableId') ||
    params.get('tableId') ||
    '';
  const tableNo = params.get('tableNo') || params.get('TableNo') || tableId;
  const Comid = params.get('Comid') || '1';

  useEffect(() => {
    if (!tableId) return;

    const previousTable = sessionStorage.getItem('customerTable');
    if (previousTable && previousTable !== tableId) {
      dispatch(clearCart());
    }

    sessionStorage.setItem('customerTable', tableId);
    sessionStorage.setItem('customerComid', Comid);
    dispatch(fetchCategories({ Comid }));
    dispatch(fetchMenu({ Comid, CategoryId: 0 }));
    dispatch(fetchRunningOrderForTable({ Comid, tableId }));
  }, [Comid, dispatch, tableId]);

  const chooseCategory = id => {
    const next = String(id);
    setCategory(next);
    dispatch(fetchMenu({ Comid, CategoryId: next }));
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menu.items.filter(item => item.name.toLowerCase().includes(query));
  }, [menu.items, search]);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (!tableId) {
    return (
      <div className="center-message customer-invalid">
        Invalid QR code: table information is missing.
      </div>
    );
  }

  return (
    <div className="customer-app">
      <CustomerHeader
        tableNo={tableNo}
        search={search}
        setSearch={setSearch}
      />
      <CategoryTabs
        categories={menu.categories}
        active={category}
        onChange={chooseCategory}
      />
      {menu.error && (
        <div className="error-box customer-error">{String(menu.error)}</div>
      )}
      {currentOrder?.transid && (
        <div className="customer-running-order">
          <div>
            <strong>Current order #{currentOrder.orderNo}</strong>
            <span>{currentOrder.items?.reduce((sum, item) => sum + item.qty, 0) || 0} items already ordered</span>
          </div>
          <span>New items will be added to this order</span>
        </div>
      )}
      <main className="customer-menu-grid">
        {menu.loading && !menu.items.length ? (
          <div className="center-message">Loading menu...</div>
        ) : (
          filtered.map(item => {
            const qty =
              cart.find(cartItem => String(cartItem.id) === String(item.id))?.qty ||
              0;

            return (
              <FoodCard
                key={item.id}
                item={item}
                qty={qty}
                onAdd={() => dispatch(addToCart(item))}
                onChange={delta =>
                  dispatch(changeQty({ id: item.id, delta }))
                }
              />
            );
          })
        )}
        {!menu.loading && !filtered.length && (
          <div className="center-message">No dishes found.</div>
        )}
      </main>
      <FloatingCart count={count} total={total} />
    </div>
  );
}
