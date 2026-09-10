import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Minus,
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchMenu } from '../../store/slices/menuSlice';
import {
  addOrderItem,
  decrementOrderItem,
  fetchOrderDetail,
  removeOrderItem,
  resetCurrentOrder,
  setCurrentOrder,
} from '../../store/slices/orderSlice';

export default function RunningOrderPage() {
  const { tableId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const menu = useSelector(state => state.menu);
  const order = useSelector(state => state.orders);
  console.log(order);

  const [category, setCategory] = useState('0');
  const [addedId, setAddedId] = useState(null);
  const [mobileNo, setMobileNo] = useState('');

  const table = location.state?.table || {
    id: tableId,
    tableNo: `Table ${tableId}`,
  };
  const Comid = auth.userData?.Comid || '1';
  const Uid = auth.userData?.Uid || auth.userData?.UserId || '1';

  useEffect(() => {
    dispatch(fetchCategories({ Comid }));
    dispatch(fetchMenu({ Comid, CategoryId: 0 }));

    const current = location.state?.currentOrder;
    if (current?.transid) {
      dispatch(
        setCurrentOrder({
          transid: current.transid,
          OrderNo: current.orderNo,
        }),
      );
      dispatch(fetchOrderDetail({ Comid, transid: current.transid }));
    } else {
      dispatch(resetCurrentOrder());
    }

    const savedMobile = sessionStorage.getItem(`waiterMobile-${tableId}`) || '';
    setMobileNo(savedMobile);

    return () => dispatch(resetCurrentOrder());
  }, [Comid, dispatch, location.state?.currentOrder, tableId]);

  const selectCategory = id => {
    const next = String(id);
    setCategory(next);
    dispatch(fetchMenu({ Comid, CategoryId: next }));
  };

  const refresh = () => {
    dispatch(fetchMenu({ Comid, CategoryId: category }));
    if (order.transid !== '0') {
      dispatch(fetchOrderDetail({ Comid, transid: order.transid }));
    }
  };

  const handleMobileChange = event => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNo(value);
    sessionStorage.setItem(`waiterMobile-${tableId}`, value);
  };

  const add = async item => {
    if (order.adding) return;

    setAddedId(item.id);
    const result = await dispatch(
      addOrderItem({
        tableId,
        menuId: item.id,
        qty: 1,
        Comid,
        Uid,
        transid: order.transid,
        OrderNo: order.OrderNo,
      }),
    );

    if (addOrderItem.fulfilled.match(result)) {
      await dispatch(
        fetchOrderDetail({ Comid, transid: result.payload.transid }),
      );
    }

    setAddedId(null);
  };

  const total = useMemo(
    () => order.items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [order.items],
  );
  const itemCount = useMemo(
    () => order.items.reduce((sum, item) => sum + item.qty, 0),
    [order.items],
  );

  return (
    <div className="screen order-screen">
      <header className="order-header">
        <button
          className="back-button"
          onClick={() => navigate('/waiter/tables')}
        >
          <ArrowLeft size={17} />
          Tables
        </button>

        <div className="order-heading">
          <span>TABLE</span>
          <strong>{table.tableNo}</strong>
        </div>
        <div className="order-heading">
          <span>ORDER NO.</span>
          <strong>{order.transid === '0' ? 'NEW' : order.OrderNo}</strong>
        </div>
        <div className="order-heading">
          <span>TRANS ID</span>
          <strong>{order.transid === '0' ? '—' : order.transid}</strong>
        </div>

        <div className="mobile-order-field">
          <Smartphone size={15} />
          <div>
            <span>Customer mobile</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobileNo}
              onChange={handleMobileChange}
              placeholder="10 digit number"
            />
          </div>
        </div>
        <div className="header-spacer" />
        <button className="header-action" onClick={refresh}>
          <RefreshCw size={16} className={order.loading ? 'spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="order-workspace">
        <aside className="category-sidebar">
          <div className="sidebar-label">MENU</div>
          <button
            className={`category-button ${category === '0' ? 'active' : ''}`}
            onClick={() => selectCategory(0)}
          >
            All Items
          </button>
          {menu.categories.map(item => (
            <button
              key={item.id}
              className={`category-button ${category === String(item.id) ? 'active' : ''
                }`}
              onClick={() => selectCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </aside>

        <section className="menu-grid">
          {menu.loading && !menu.items.length ? (
            <div className="center-message">Loading menu...</div>
          ) : (
            menu.items.map(item => (
              <button
                className="menu-item-card"
                key={item.id}
                onClick={() => add(item)}
                disabled={order.adding}
              >
                <div className="menu-card-top">
                  <span className="menu-dot" />
                  <strong>{item.name}</strong>
                </div>
                <span className="menu-price">₹ {item.price.toFixed(2)}</span>
                {addedId === item.id && order.adding ? (
                  <small>
                    <LoaderCircle size={13} className="spin" />
                    Adding...
                  </small>
                ) : (
                  <small>
                    <Plus size={13} />
                    Add item
                  </small>
                )}
              </button>
            ))
          )}
          {!menu.loading && !menu.items.length && (
            <div className="empty-menu">No items in this category.</div>
          )}
        </section>

        <aside className="order-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">ORDER SUMMARY</span>
              <h2>Current Order</h2>
              <span>{itemCount} items</span>
            </div>
            <span className="order-state">
              <span />
              {order.transid === '0' ? 'New order' : 'Running'}
            </span>
          </div>

          {order.error && <div className="error-box">{String(order.error)}</div>}

          <div className="order-table-header">
            <span>ITEM</span>
            <span>QTY</span>
            <span>AMOUNT</span>
            <span>ACTION</span>
          </div>

          <div className="order-list">
            {order.loading && order.items.length === 0 ? (
              <div className="center-message">Loading order...</div>
            ) : (
              order.items.map(item => (
                <div className="order-row" key={item.key}>
                  <div>
                    <span className="order-item-name">{item.name}</span>
                    <span className="status-pill">
                      {item.kitchenStatus || 'New'}
                    </span>
                  </div>
                  <div className="waiter-qty">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => dispatch(decrementOrderItem(item.key))}
                    >
                      <Minus size={12} />
                    </button>
                    <strong>{item.qty}</strong>
                    {/* <button
                      type="button"
                      aria-label="Increase quantity"
                      title="Add another unit from the menu"
                      onClick={() => {
                        const menuItem = menu.items.find(
                          menuItem =>
                            String(menuItem.name).trim().toLowerCase() ===
                            String(item.name).trim().toLowerCase()
                        );

                        if (menuItem) {
                          add(menuItem);
                        }
                      }}
                    >
                      <Plus size={12} />
                    </button> */}
                  </div>
                  <span>₹ {(item.price * item.qty).toFixed(2)}</span>
                  <button
                    type="button"
                    className="order-remove"
                    aria-label={`Remove ${item.name}`}
                    title="Remove from waiter view"
                    onClick={() => dispatch(removeOrderItem(item.key))}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}

            {!order.loading && !order.items.length && (
              <div className="empty-order">
                No items in this order yet. Tap a menu item to add it.
              </div>
            )}
          </div>

          <div className="order-summary">
            <span>Order total</span>
            <strong>₹ {total.toFixed(2)}</strong>
          </div>

          {order.transid !== '0' && (
            <div className="order-confirmed">
              <Check size={15} />
              Saved to order #{order.OrderNo}
            </div>
          )}

          <div className="order-note">
            Mobile number is captured for the order. The current AddOrder API
            does not expose a mobile-number parameter, so it is retained in
            this waiter session until the backend supports it.
          </div>
        </aside>
      </div>
    </div>
  );
}
