import { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userLogin } from '../../store/slices/authSlice';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, status } = useSelector(state => state.auth);

  useEffect(() => {
    if (status === 'authenticated') navigate('/waiter/tables', { replace: true });
  }, [navigate, status]);

  const submit = async event => {
    event.preventDefault();
    const result = await dispatch(userLogin({ username: username.trim(), password }));
    if (userLogin.fulfilled.match(result)) navigate('/waiter/tables', { replace: true });
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon"><LogIn size={22} /></div>
        <span className="eyebrow">RESTAURANT POS</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage tables and orders.</p>
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
        {error && <div className="error-box">{String(error)}</div>}
        <button className="login-button" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
