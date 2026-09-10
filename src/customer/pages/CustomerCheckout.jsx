import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, Smartphone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addOrderItem, fetchRunningOrderForTable } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';

export default function CustomerCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(state => state.cart.items);
  const currentOrder = useSelector(state => state.orders.customerCurrentOrder);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mobileNo, setMobileNo] = useState(
    sessionStorage.getItem('customerMobile') || '',
  );

  const tableId =
    params.get('table') || sessionStorage.getItem('customerTable') || '';
  const Comid =
    params.get('Comid') || sessionStorage.getItem('customerComid') || '1';
  const Uid = params.get('Uid') || '1';
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  useEffect(() => {
    sessionStorage.setItem('customerMobile', mobileNo);
  }, [mobileNo]);

  useEffect(() => {
    if (tableId) {
      dispatch(fetchRunningOrderForTable({ Comid, tableId }));
    }
  }, [Comid, dispatch, tableId]);

  const submit = async () => {
    if (!tableId) {
      setError('Table information is missing from the QR code.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNo)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      // Re-check the table's running order immediately before adding. This
      // prevents a second customer visit from accidentally creating a new
      // order when the table already has one running.
      const runningResult = await dispatch(
        fetchRunningOrderForTable({ Comid, tableId }),
      );
      const runningOrder = fetchRunningOrderForTable.fulfilled.match(runningResult)
        ? runningResult.payload
        : currentOrder;

      let transid = String(runningOrder?.transid || '0');
      let orderNo = String(runningOrder?.orderNo || ',,');

      for (const item of items) {
        const result = await dispatch(
          addOrderItem({
            tableId,
            menuId: item.id,
            qty: item.qty,
            Comid,
            Uid,
            transid,
            OrderNo: orderNo,
          }),
        );

        if (!addOrderItem.fulfilled.match(result)) {
          throw new Error(result.payload || 'Unable to place order');
        }

        transid = String(result.payload.transid || transid);
        orderNo = String(result.payload.OrderNo || orderNo);
      }

      dispatch(clearCart());
      sessionStorage.setItem(
        'customerOrder',
        JSON.stringify({ transid, orderNo, tableId, Comid, mobileNo }),
      );
      navigate(
        `/customer/confirmation?transid=${encodeURIComponent(
          transid,
        )}&orderNo=${encodeURIComponent(orderNo)}&table=${encodeURIComponent(
          tableId,
        )}&Comid=${encodeURIComponent(Comid)}`,
      );
    } catch (err) {
      setError(err.message || 'Unable to place order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="customer-page">
      <div className="customer-card checkout-card">
        <button
          className="back-link"
          onClick={() =>
            navigate(
              `/customer/cart?table=${encodeURIComponent(
                tableId,
              )}&Comid=${encodeURIComponent(Comid)}`,
            )
          }
        >
          <ArrowLeft size={16} />
          Back to cart
        </button>

        <div className="customer-page-title">
          <div className="page-icon">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2>Confirm order</h2>
            {/* <span>Table {tableId}</span> */}
          </div>
        </div>

        <div className="mobile-field-card">
          <div className="mobile-field-icon">
            <Smartphone size={18} />
          </div>
          <div>
            <label htmlFor="customer-mobile">Mobile number</label>
            <p>Used by the restaurant to identify your order.</p>
            <input
              id="customer-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobileNo}
              onChange={event =>
                setMobileNo(event.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="Enter 10-digit mobile number"
            />
          </div>
        </div>

        <div className="checkout-list">
          {items.map(item => (
            <div className="checkout-line" key={item.id}>
              <span>
                {item.qty} × {item.name}
              </span>
              <b>₹ {(item.qty * item.price).toFixed(2)}</b>
            </div>
          ))}
        </div>

        <div className="total-line grand-total">
          <span>Total</span>
          <b>₹ {total.toFixed(2)}</b>
        </div>

        <p className="checkout-note">
          Your order will be sent directly to the restaurant using this table's
          QR code.
        </p>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-full" disabled={busy} onClick={submit}>
          {busy ? (
            <>
              <LoaderCircle size={17} className="spin" />
              Placing order...
            </>
          ) : (
            'Place order'
          )}
        </button>
      </div>
    </div>
  );
}
