import { useEffect, useMemo, useState } from 'react';
import { LogOut, RefreshCw, SlidersHorizontal, Utensils } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTableData } from '../../store/slices/tableSlice';
import { fetchRunningOrders } from '../../store/slices/orderSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { isOccupied } from '../../utils/normalize';

export default function TablesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);
  const tables = useSelector(state => state.tables);
  const orders = useSelector(state => state.orders.running);
  const [section, setSection] = useState('0');
  const [floor, setFloor] = useState('0');
  const [columns, setColumns] = useState(6);

  const Comid = auth.userData?.Comid || '1';
  const shown = useMemo(() => tables.tables, [tables.tables]);

  const load = () => {
    dispatch(fetchTableData({ Comid, SectionId: section, FloorId: floor }));
    dispatch(fetchRunningOrders({ Comid }));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Comid, section, floor]);

  const openTable = table => {
    const tableOrders = orders.filter(
      order => String(order.tableId) === String(table.id),
    );
    const current = [...tableOrders].sort(
      (a, b) => Number(b.transid) - Number(a.transid),
    )[0];

    navigate(`/waiter/order/${table.id}`, {
      state: { table, currentOrder: current || null },
    });
  };

  const exit = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <div className="screen tables-screen">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark">
            <Utensils size={17} />
          </div>
          <div>
            <strong>Restaurant POS</strong>
            <span>Waiter workspace</span>
          </div>
        </div>

        <div className="header-filters">
          <div className="header-field">
            <span className="field-label">Section</span>
            <select value={section} onChange={event => setSection(event.target.value)}>
              <option value="0">All Sections</option>
              {tables.sections.map(item => (
                <option key={item.Id} value={item.Id}>
                  {item.SectionName}
                </option>
              ))}
            </select>
          </div>

          <div className="header-field">
            <span className="field-label">Floor</span>
            <select value={floor} onChange={event => setFloor(event.target.value)}>
              <option value="0">All Floors</option>
              {tables.floors.map(item => (
                <option key={item.Id} value={item.Id}>
                  {item.FloorName}
                </option>
              ))}
            </select>
          </div>

          <div className="header-field table-count-field">
            <span className="field-label">Tables / row</span>
            <input
              type="number"
              min="1"
              max="12"
              value={columns}
              onChange={event =>
                setColumns(
                  Math.max(1, Math.min(12, Number(event.target.value) || 1)),
                )
              }
            />
          </div>
        </div>

        <div className="header-spacer" />
        <button className="header-action" onClick={load} disabled={tables.loading}>
          <RefreshCw size={16} className={tables.loading ? 'spin' : ''} />
          Refresh
        </button>
        <button className="header-action secondary" onClick={exit}>
          <LogOut size={16} />
          Exit
        </button>
      </header>

      <main className="table-content">
        <div className="page-heading-row">
          {/* <div>
            <span className="eyebrow">FLOOR OVERVIEW</span>
            <h1>Tables</h1>
            <p>
              Choose a table to start a new order or continue a running order.
            </p>
          </div> */}
          {/* <div className="filter-caption">
            <SlidersHorizontal size={15} />
            {section === '0' ? 'All sections' : 'Filtered section'}
          </div> */}
        </div>

        {/* <div className="dashboard-strip">
          <div className="stat-card accent">
            <span>Total Tables</span>
            <strong>{tables.tableCount}</strong>
          </div>
          <div className="stat-card">
            <span>Available</span>
            <strong>{tables.availableCount}</strong>
          </div>
          <div className="stat-card occupied-stat">
            <span>Occupied</span>
            <strong>{tables.occupiedCount}</strong>
          </div>
          <div className="stat-card">
            <span>Not Available</span>
            <strong>{tables.notAvailableCount}</strong>
          </div>
          <div className="stat-card">
            <span>Today's Orders</span>
            <strong>{tables.todaysOrder}</strong>
          </div>
          <div className="stat-card sales-stat">
            <span>Today's Sale</span>
            <strong>₹ {tables.todaysSale.toFixed(2)}</strong>
          </div>
        </div> */}

        {tables.error && <div className="error-box">{String(tables.error)}</div>}

        {tables.loading && !shown.length ? (
          <div className="center-message">Loading tables...</div>
        ) : (
          <div
            className="table-grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {shown.map(table => {
              const occupied = isOccupied(table);

              return (
                <button
                  key={table.id}
                  className={`table-card ${occupied ? 'occupied' : 'available'}`}
                  onClick={() => openTable(table)}
                >
                  <div className="table-card-top">
                    <span className="table-title">{table.tableNo}</span>
                    {/* <span className="occupied-badge">
                      {occupied ? 'OCCUPIED' : 'AVAILABLE'}
                    </span> */}
                  </div>
                  {/* <span className="table-type">
                    {table.floor || 'Floor'}
                    {table.section ? ` · ${table.section}` : ''}
                  </span> */}
                  {/* <span className="table-capacity">Capacity {table.capacity}</span> */}
                  <span className="table-open-hint">
                    {occupied ? 'Continue order' : 'Start order'}
                  </span>
                </button>
              );
            })}
            {!shown.length && (
              <div className="center-message">
                No tables found for the selected filters.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
