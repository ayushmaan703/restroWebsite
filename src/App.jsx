import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './waiter/pages/LoginPage';
import TablesPage from './waiter/pages/TablesPage';
import RunningOrderPage from './waiter/pages/RunningOrderPage';
import CustomerMenu from './customer/pages/CustomerMenu';
import CustomerCart from './customer/pages/CustomerCart';
import CustomerCheckout from './customer/pages/CustomerCheckout';
import OrderConfirmation from './customer/pages/OrderConfirmation';
import './index.css';

function WaiterRoute({ children }) {
  const authenticated = Boolean(localStorage.getItem('restaurantUser'));
  return authenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/waiter/tables"
        element={
          <WaiterRoute>
            <TablesPage />
          </WaiterRoute>
        }
      />
      <Route
        path="/waiter/order/:tableId"
        element={
          <WaiterRoute>
            <RunningOrderPage />
          </WaiterRoute>
        }
      />
      <Route path="/customer/order" element={<CustomerMenu />} />
      <Route path="/customer/cart" element={<CustomerCart />} />
      <Route path="/customer/checkout" element={<CustomerCheckout />} />
      <Route path="/customer/confirmation" element={<OrderConfirmation />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
