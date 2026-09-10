import { useEffect, useState } from 'react';
import { LockKeyhole, LogIn, UserRound } from 'lucide-react';
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
    if (status === 'authenticated') {
      navigate('/waiter/tables', { replace: true });
    }
  }, [navigate, status]);

  const submit = async event => {
    event.preventDefault();
    const result = await dispatch(
      userLogin({ username: username.trim(), password }),
    );

    if (userLogin.fulfilled.match(result)) {
      navigate('/waiter/tables', { replace: true });
    }
  };

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <section className="login-layout">
        <div className="login-brand-panel">
          <div className="brand-mark large">
            <span>R</span>
          </div>
          <span className="eyebrow">RESTAURANT POS</span>
          <h1>Everything you need to run the floor.</h1>
          <p>
            Manage tables, build orders and keep the service team moving from
            one simple waiter workspace.
          </p>
          <div className="login-feature-list">
            <span>Table management</span>
            <span>Fast order entry</span>
            <span>Live running orders</span>
          </div>
        </div>

        <form className="login-card" onSubmit={submit}>
          <div className="login-card-icon">
            <LogIn size={21} />
          </div>
          <span className="eyebrow">WAITER LOGIN</span>
          <h2>Welcome back</h2>
          <p>Sign in to open your restaurant workspace.</p>

          <label htmlFor="username">Username</label>
          <div className="input-with-icon">
            <UserRound size={17} />
            <input
              id="username"
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Enter username"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-box">{String(error)}</div>}

          <button className="login-button" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign in to POS'}
            {!loading && <LogIn size={17} />}
          </button>
        </form>
      </section>
    </main>
  );
}
