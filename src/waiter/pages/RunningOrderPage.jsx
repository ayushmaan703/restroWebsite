import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, LoaderCircle, Minus, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchMenu } from '../../store/slices/menuSlice';
import { addOrderItem, decrementOrderItem, fetchOrderDetail, removeOrderItem, resetCurrentOrder, setCurrentOrder } from '../../store/slices/orderSlice';

export default function RunningOrderPage() {
  const { tableId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const menu = useSelector(state => state.menu);
  const order = useSelector(state => state.orders);
  const [category, setCategory] = useState('0');
  const [addedId, setAddedId] = useState(null);

  const table = location.state?.table || { id: tableId, tableNo: `Table ${tableId}` };
  const Comid = auth.userData?.Comid || '1';
  const Uid = auth.userData?.Uid || auth.userData?.UserId || '1';

  useEffect(() => {
    dispatch(fetchCategories({ Comid }));
    dispatch(fetchMenu({ Comid, CategoryId: 0 }));
    const current = location.state?.currentOrder;
    if (current?.transid) {
      dispatch(setCurrentOrder({ transid: current.transid, OrderNo: current.orderNo }));
      dispatch(fetchOrderDetail({ Comid, transid: current.transid }));
    } else {
      dispatch(resetCurrentOrder());
    }
    return () => dispatch(resetCurrentOrder());
  }, [Comid, dispatch, location.state?.currentOrder]);

  const selectCategory = id => {
    const next = String(id);
    setCategory(next);
    dispatch(fetchMenu({ Comid, CategoryId: next }));
  };

  const refresh = () => {
    dispatch(fetchMenu({ Comid, CategoryId: category }));
    if (order.transid !== '0') dispatch(fetchOrderDetail({ Comid, transid: order.transid }));
  };

  const add = async item => {
    if (order.adding) return;
    setAddedId(item.id);
    const result = await dispatch(addOrderItem({
      tableId,
      menuId: item.id,
      qty: 1,
      Comid,
      Uid,
      transid: order.transid,
      OrderNo: order.OrderNo,
    }));
    if (addOrderItem.fulfilled.match(result)) {
      await dispatch(fetchOrderDetail({ Comid, transid: result.payload.transid }));
    }
    setAddedId(null);
  };

  const total = useMemo(() => order.items.reduce((sum, item) => sum + item.price * item.qty, 0), [order.items]);
  const itemCount = useMemo(() => order.items.reduce((sum, item) => sum + item.qty, 0), [order.items]);

  return (
    <div className="screen order-screen">
      <header className="order-header">
        <button className="back-button" onClick={() => navigate('/waiter/tables')}><ArrowLeft size={17} /> Tables</button>
        <div className="order-heading"><span>TABLE</span><strong>{table.tableNo}</strong></div>
        <div className="order-heading"><span>ORDER NO.</span><strong>{order.transid === '0' ? 'NEW' : order.OrderNo}</strong></div>
        <div className="order-heading"><span>TRANS ID</span><strong>{order.transid === '0' ? '—' : order.transid}</strong></div>
        <div className="header-spacer" />
        <button className="header-action" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
      </header>

      <div className="order-workspace">
        <aside className="category-sidebar">
          <button className={`category-button ${category === '0' ? 'active' : ''}`} onClick={() => selectCategory(0)}>All Items</button>
          {menu.categories.map(item => (
            <button key={item.id} className={`category-button ${category === String(item.id) ? 'active' : ''}`} onClick={() => selectCategory(item.id)}>{item.name}</button>
          ))}
        </aside>

        <section className="menu-grid">
          {menu.loading && !menu.items.length ? <div className="center-message">Loading menu...</div> : menu.items.map(item => (
            <button className="menu-item-card" key={item.id} onClick={() => add(item)} disabled={order.adding}>
              <div className="menu-card-top"><span className="menu-dot" /> <strong>{item.name}</strong></div>
              <span className="menu-price">₹ {item.price.toFixed(2)}</span>
              {addedId === item.id && order.adding ? <small><LoaderCircle size={13} className="spin" /> Adding...</small> : <small><Plus size={13} /> Add item</small>}
            </button>
          ))}
          {!menu.loading && !menu.items.length && <div className="empty-menu">No items in this category.</div>}
        </section>

        <aside className="order-panel">
          <div className="panel-title-row"><div><h2>Current Order</h2><span>{itemCount} items</span></div><span className="order-state"><span /> {order.transid === '0' ? 'New order' : 'Running'}</span></div>
          {order.error && <div className="error-box">{String(order.error)}</div>}
          <div className="order-table-header"><span>ITEM</span><span>QTY</span><span>AMOUNT</span><span>KITCHEN / ACTION</span></div>
          <div className="order-list">
            {order.loading && order.items.length === 0 ? <div className="center-message">Loading order...</div> : order.items.map(item => (
              <div className="order-row" key={item.key}>
                <span className="order-item-name">{item.name}</span>
                <div className="waiter-qty">
                  <button type="button" aria-label="Decrease quantity" onClick={() => dispatch(decrementOrderItem(item.key))}><Minus size={12} /></button>
                  <strong>{item.qty}</strong>
                  <button type="button" aria-label="Increase quantity" title="Quantity update requires a backend API" disabled><Plus size={12} /></button>
                </div>
                <span>₹ {(item.price * item.qty).toFixed(2)}</span>
                <div className="order-actions">
                  <span className="status-pill">{item.kitchenStatus || 'New'}</span>
                  <button type="button" className="order-remove" aria-label={`Remove ${item.name}`} title="Remove from waiter view" onClick={() => dispatch(removeOrderItem(item.key))}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {!order.loading && !order.items.length && <div className="empty-order">No items in this order yet. Tap a menu item to add it.</div>}
          </div>
          <div className="order-summary"><span>Order total</span><strong>₹ {total.toFixed(2)}</strong></div>
          {order.transid !== '0' && <div className="order-confirmed"><Check size={15} /> Saved to order #{order.OrderNo}</div>}
          {order.transid !== '0' && <div className="order-note">Remove only changes the waiter view because no delete-item API has been provided yet.</div>}
        </aside>
      </div>
    </div>
  );
}
