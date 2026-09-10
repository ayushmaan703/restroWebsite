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
  const [category, setCategory] = useState('0');
  const [addedId, setAddedId] = useState(null);
  const [mobileNo, setMobileNo] = useState('');
  const [quantityModal, setQuantityModal] = useState(null);

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

  const add = async (item, qty = 1) => {
    if (order.adding) return;

    setAddedId(item.id);
    const result = await dispatch(
      addOrderItem({
        tableId,
        menuId: item.id,
        qty,
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

      <style>{`
        .quantity-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(4px);
        }
        .quantity-modal {
          width: min(420px, 100%);
          background: #fff;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
          animation: quantityModalIn 0.18s ease-out;
        }
        @keyframes quantityModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .quantity-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .quantity-modal-eyebrow {
          display: block;
          margin-bottom: 5px;
          color: #718096;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }
        .quantity-modal h3 {
          margin: 0;
          color: #172033;
          font-size: 20px;
          line-height: 1.2;
        }
        .quantity-modal-price {
          display: block;
          margin-top: 6px;
          color: #64748b;
          font-size: 13px;
        }
        .quantity-modal-close {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 26px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }
        .quantity-selector > span {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .quantity-controls button {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid #dbe2ea;
          border-radius: 10px;
          background: #fff;
          color: #172033;
          cursor: pointer;
        }
        .quantity-controls button:hover {
          background: #f8fafc;
        }
        .quantity-controls strong {
          min-width: 24px;
          text-align: center;
          color: #172033;
          font-size: 18px;
        }
        .quantity-modal-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 18px;
          color: #64748b;
          font-size: 13px;
        }
        .quantity-modal-total strong {
          color: #172033;
          font-size: 20px;
        }
        .quantity-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 10px;
          margin-top: 22px;
        }
        .quantity-cancel,
        .quantity-confirm {
          min-height: 44px;
          border-radius: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .quantity-cancel {
          border: 1px solid #dbe2ea;
          background: #fff;
          color: #475569;
        }
        .quantity-confirm {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          background: #172033;
          color: #fff;
        }
        .quantity-confirm:disabled {
          opacity: .65;
          cursor: not-allowed;
        }
        @media (max-width: 520px) {
          .quantity-modal { padding: 18px; border-radius: 16px; }
          .quantity-modal h3 { font-size: 18px; }
        }
      `}</style>
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

        {/* <div className="mobile-order-field">
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
        </div> */}

        <div className="header-spacer" />
        <button className="header-action" onClick={refresh}>
          <RefreshCw size={16} />
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
                onClick={() => setQuantityModal({ item, quantity: 1 })}
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
                      onClick={() =>
                        menu.items.some(menuItem => String(menuItem.id) === String(item.menuId)) &&
                        add(menu.items.find(menuItem => String(menuItem.id) === String(item.menuId)))
                      }
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

          {/* {order.transid !== '0' && (
            <div className="order-confirmed">
              <Check size={15} />
              Saved to order #{order.OrderNo}
            </div>
          )} */}

          {/* <div className="order-note">
            Mobile number is captured for the order. The current AddOrder API
            does not expose a mobile-number parameter, so it is retained in
            this waiter session until the backend supports it.
          </div> */}
        </aside>
      </div>

      {quantityModal && (
        <div
          className="quantity-modal-backdrop"
          role="presentation"
          onClick={() => setQuantityModal(null)}
        >
          <div
            className="quantity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quantity-modal-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="quantity-modal-header">
              <div>
                <span className="quantity-modal-eyebrow">ADD TO ORDER</span>
                <h3 id="quantity-modal-title">{quantityModal.item.name}</h3>
                <span className="quantity-modal-price">
                  ₹ {quantityModal.item.price.toFixed(2)} each
                </span>
              </div>
              <button
                type="button"
                className="quantity-modal-close"
                aria-label="Close quantity selector"
                onClick={() => setQuantityModal(null)}
              >
                ×
              </button>
            </div>

            <div className="quantity-selector">
              <span>Quantity</span>
              <div className="quantity-controls">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantityModal(current => ({
                      ...current,
                      quantity: Math.max(1, current.quantity - 1),
                    }))
                  }
                >
                  <Minus size={18} />
                </button>
                <strong>{quantityModal.quantity}</strong>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantityModal(current => ({
                      ...current,
                      quantity: current.quantity + 1,
                    }))
                  }
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="quantity-modal-total">
              <span>Total</span>
              <strong>
                ₹ {(quantityModal.item.price * quantityModal.quantity).toFixed(2)}
              </strong>
            </div>

            <div className="quantity-modal-actions">
              <button
                type="button"
                className="quantity-cancel"
                onClick={() => setQuantityModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="quantity-confirm"
                disabled={order.adding}
                onClick={async () => {
                  const { item, quantity } = quantityModal;
                  setQuantityModal(null);
                  await add(item, quantity);
                }}
              >
                {order.adding ? (
                  <>
                    <LoaderCircle size={15} className="spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Add {quantityModal.quantity} Item
                    {quantityModal.quantity > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
