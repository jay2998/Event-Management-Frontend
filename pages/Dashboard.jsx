import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { fetchBookings, fetchStats, fetchHalls, fetchVehicles, fetchRentals } from '../services/api';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { renderAppIcon } from '../components/icon/AppIcons';

/* ─────────────────────────────────────────────────────────
   Event Type Config
───────────────────────────────────────────────────────── */
const EVENT_TYPES = {
  wedding   : { color: '#be185d', bg: '#fdf2f8', label: 'Wedding',   icon: 'heart' },
  corporate : { color: '#1d4ed8', bg: '#eff6ff', label: 'Corporate', icon: 'briefcase' },
  birthday  : { color: '#d97706', bg: '#fffbeb', label: 'Birthday',  icon: 'cake' },
  gala      : { color: '#7c3aed', bg: '#f5f3ff', label: 'Gala',      icon: 'sparkles' },
  other     : { color: '#0d9488', bg: '#f0fdfa', label: 'Event',     icon: 'partyPopper' },
};

const getEventType = (booking) => {
  const raw = `${booking.eventType || ''} ${booking.eventName || ''}`.toLowerCase();
  if (/wedding|nikah|walima|bridal|nikkah/.test(raw))          return 'wedding';
  if (/corporate|conference|seminar|meeting|summit/.test(raw)) return 'corporate';
  if (/birthday|annivers|bday/.test(raw))                      return 'birthday';
  if (/gala|awards|charity|dinner|ball/.test(raw))             return 'gala';
  return 'other';
};

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

/* ─────────────────────────────────────────────────────────
   Banner Decoration SVG
───────────────────────────────────────────────────────── */
const BannerDecoration = () => (
  <svg
    style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '420px', opacity: 0.1, pointerEvents: 'none' }}
    viewBox="0 0 420 160" fill="none" preserveAspectRatio="xMaxYMid slice"
  >
    <circle cx="360" cy="80"  r="90"  stroke="white" strokeWidth="1.5"/>
    <circle cx="360" cy="80"  r="60"  stroke="white" strokeWidth="1"/>
    <circle cx="360" cy="80"  r="30"  stroke="white" strokeWidth="0.75"/>
    <circle cx="100" cy="20"  r="35"  stroke="white" strokeWidth="1"/>
    <circle cx="30"  cy="130" r="45"  stroke="white" strokeWidth="0.8"/>
    {[...Array(18)].map((_, i) => (
      <circle key={i} cx={10 + i * 22} cy={155} r="1.8" fill="white"/>
    ))}
    {[...Array(6)].map((_, i) => (
      <circle key={`d${i}`} cx={50 + i * 60} cy={8} r="2.5" fill="white" opacity="0.6"/>
    ))}
  </svg>
);

/* ─────────────────────────────────────────────────────────
   Mini Calendar
───────────────────────────────────────────────────────── */
const MiniCalendar = ({ bookings }) => {
  const [current, setCurrent] = useState(new Date());
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(current.getFullYear(), current.getMonth(), 1).getDay();

  const bookingMap = useMemo(() => {
    const map = {};
    (bookings || []).forEach(b => {
      const key = new Date(b.eventDate).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(getEventType(b));
    });
    return map;
  }, [bookings]);

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={styles.cardLabel}>Calendar</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' }}>
            {current.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={styles.calNavBtn} onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}>{renderAppIcon('chevronLeft', { size: 14 })}</button>
          <button style={styles.calNavBtn} onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}>{renderAppIcon('chevronRight', { size: 14 })}</button>
        </div>
      </div>

      <div style={styles.calendarGrid}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
          <div key={i} style={styles.calWeekday}>{d}</div>
        ))}
        {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day     = i + 1;
          const date    = new Date(current.getFullYear(), current.getMonth(), day);
          const isToday = date.toDateString() === new Date().toDateString();
          const types   = bookingMap[date.toDateString()] || [];
          const hasEvt  = types.length > 0;
          const tc      = EVENT_TYPES[types[0] || 'other'];
          return (
            <div key={day} style={{
              ...styles.calDay,
              backgroundColor : isToday ? 'var(--color-primary)' : hasEvt ? tc.bg   : 'transparent',
              color           : isToday ? 'white'                : hasEvt ? tc.color : 'var(--color-text)',
              fontWeight      : isToday || hasEvt ? '700' : '400',
              border          : hasEvt && !isToday ? `1px solid ${tc.color}33` : 'none',
              position        : 'relative',
            }}>
              {day}
              {hasEvt && !isToday && (
                <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: tc.color }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
        {Object.entries(EVENT_TYPES).slice(0, 4).map(([key, t]) => (
          <div key={key} style={styles.legendItem}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: t.color, flexShrink: 0 }} />
            <span style={styles.legendText}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    confirmed : { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
    pending   : { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
    cancelled : { bg: 'var(--color-error-light)',   color: 'var(--color-error)'   },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return <span style={{ ...styles.badge, backgroundColor: s.bg, color: s.color }}>{status || 'Pending'}</span>;
};

/* ─────────────────────────────────────────────────────────
   Countdown Badge
───────────────────────────────────────────────────────── */
const CountdownBadge = ({ days }) => {
  if (days === 0) return <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#d97706', fontWeight: '700' }}>Today</span>;
  if (days  <  0) return <span style={{ ...styles.badge, backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-light)' }}>Past</span>;
  if (days  <= 7) return <span style={{ ...styles.badge, backgroundColor: '#fdf2f8', color: '#be185d', fontWeight: '700' }}>{days}d away</span>;
  return <span style={{ ...styles.badge, backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-light)' }}>{days}d away</span>;
};

/* ─────────────────────────────────────────────────────────
   Venue Availability
───────────────────────────────────────────────────────── */
const VenueAvailability = ({ halls }) => {
  const available = halls.filter(h => h.isAvailable).length;
  const total     = halls.length;
  const pct       = total ? Math.round((available / total) * 100) : 0;

  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>Venue Availability</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>{available}</span>
        <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>of {total} halls open</span>
      </div>
      <div style={{ backgroundColor: 'var(--color-border)', borderRadius: '99px', height: '6px', marginBottom: '14px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', background: 'linear-gradient(90deg, var(--color-primary), #0d9488)' }} />
      </div>
      {halls.slice(0, 4).map(hall => (
        <div key={hall._id || hall.id} style={styles.venueRow}>
          <span style={styles.venueName}>{hall.name || hall.hallName || 'Unnamed Hall'}</span>
          <span style={{ ...styles.badge, backgroundColor: hall.isAvailable ? 'var(--color-success-light)' : 'var(--color-error-light)', color: hall.isAvailable ? 'var(--color-success)' : 'var(--color-error)' }}>
            {hall.isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>
      ))}
      {halls.length > 4 && (
        <Link to="/halls" style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>
          +{halls.length - 4} more halls →
        </Link>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [stats,          setStats]          = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [halls,          setHalls]          = useState([]);
  const [vehicles,       setVehicles]       = useState([]);
  const [rentals,        setRentals]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [qualityAlerts,  setQualityAlerts]  = useState([]);

  const navigate = useNavigate();

  const getUser = () => {
    try {
      const s = localStorage.getItem('user');
      if (!s || s === 'undefined') return {};
      return JSON.parse(s);
    } catch { return {}; }
  };
  const user       = getUser();
  const isCustomer = user.role === 'customer';

  useEffect(() => {
    if (!isCustomer) { loadDashboardData(); loadQualityAlerts(); }
    else setLoading(false);
    const onAlert = (e) => setQualityAlerts(prev => [e.detail, ...prev]);
    window.addEventListener('qualityAlertAdded', onAlert);
    return () => window.removeEventListener('qualityAlertAdded', onAlert);
  }, [isCustomer]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes, hRes, vRes, rRes] = await Promise.all([
        fetchBookings(),
        fetchStats().catch(()   => ({ data: { data: {} } })),
        fetchHalls().catch(()   => ({ data: { data: [] } })),
        fetchVehicles().catch(() => ({ data: { data: [] } })),
        fetchRentals().catch(()  => ({ data: { data: [] } })),
      ]);
      const bookingsData = bRes.data?.data || [];
      const statsData = sRes.data?.data || {};
      const totalRevenue = statsData.totalRevenue ?? bookingsData.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);

      setRecentBookings(bookingsData.slice(0, 10));
      setStats({
        totalBookings: statsData.totalBookings ?? statsData.total ?? bookingsData.length,
        confirmedBookings: statsData.confirmedBookings ?? statsData.confirmed ?? bookingsData.filter(booking => booking.status === 'confirmed').length,
        pendingBookings: statsData.pendingBookings ?? statsData.pending ?? bookingsData.filter(booking => booking.status === 'pending').length,
        completedBookings: statsData.completedBookings ?? statsData.completed ?? bookingsData.filter(booking => booking.status === 'completed').length,
        totalRevenue,
      });
      setHalls(hRes.data?.data || []);
      setVehicles(vRes.data?.data || []);
      setRentals(rRes.data?.data || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQualityAlerts = () => {
    try {
      const alerts = JSON.parse(localStorage.getItem('qualityAlerts') || '[]');
      setQualityAlerts(
        alerts.filter(a => !a.read).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    } catch (err) { console.error(err); }
  };

  const dismissAlert = (alertId) => {
    try {
      const alerts = JSON.parse(localStorage.getItem('qualityAlerts') || '[]');
      localStorage.setItem('qualityAlerts', JSON.stringify(
        alerts.map(a => a.id === alertId ? { ...a, read: true } : a)
      ));
      setQualityAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch {}
  };

  /* ── Derived data ── */
  const today     = new Date();
  const todayStr  = today.toDateString();

  const todayEvents = useMemo(() =>
    recentBookings.filter(b => new Date(b.eventDate).toDateString() === todayStr),
  [recentBookings]);

  const upcomingEvents = useMemo(() =>
    recentBookings
      .filter(b => daysUntil(b.eventDate) >= 0)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5),
  [recentBookings]);

  const eventTypeCounts = useMemo(() => {
    const c = { wedding: 0, corporate: 0, birthday: 0, gala: 0, other: 0 };
    recentBookings.forEach(b => { c[getEventType(b)]++; });
    return c;
  }, [recentBookings]);

  const quickActions = isCustomer ? [
    { path: '/bookings/new',      label: 'New Booking', icon: 'newBooking' },
    { path: '/catering',          label: 'Catering',    icon: 'menu'       },
    { path: '/halls',             label: 'Halls',       icon: 'halls'      },
  ] : [
    { path: '/halls',             label: 'Halls',       icon: 'halls'      },
    { path: '/bookings',          label: 'Bookings',    icon: 'bookings'   },
    { path: '/rentals/inventory', label: 'Inventory',   icon: 'inventory'  },
    { path: '/vehicles/fleet',    label: 'Fleet',       icon: 'fleet'      },
  ];

  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={styles.spinner} />
        <span style={{ fontSize: '13px', color: 'var(--color-text-light)', fontWeight: '500' }}>Loading your dashboard…</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ════════════════════════════════════════
          WELCOME BANNER
      ════════════════════════════════════════ */}
      <div style={styles.banner}>
        <BannerDecoration />
        <div style={styles.bannerLeft}>
          <div style={styles.bannerEyebrow}>
            <span style={styles.eyebrowDot} />
            {isCustomer ? 'Guest Portal' : 'Operations Command'}
          </div>
          <h1 style={styles.bannerTitle}>
            {greeting}, {user.name?.split(' ')[0] || 'there'} {renderAppIcon('smile', { size: 22, style: { display: 'inline', marginLeft: '4px', verticalAlign: 'middle' } })}
          </h1>
          <p style={styles.bannerSub}>
            {isCustomer
              ? 'Explore premium venues and bring your vision to life.'
              : upcomingEvents.length > 0
                ? `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''} on the schedule.`
                : 'System operational. All assets and logistics are live.'}
          </p>
          {!isCustomer && (
            <div style={styles.bannerBadgeRow}>
              {todayEvents.length > 0 && (
                <div style={styles.bannerBadge}>{renderAppIcon('partyPopper', { size: 12 })} {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} today</div>
              )}
              <div style={styles.bannerBadge}>{renderAppIcon('totalBookings', { size: 12 })} {stats.totalBookings || 0} total bookings</div>
              <div style={styles.bannerBadge}>{renderAppIcon('revenue', { size: 12 })} ${(stats.totalRevenue || 0).toLocaleString()} revenue</div>
            </div>
          )}
        </div>
        <div style={styles.bannerDateBox}>
          <div style={styles.bannerDateLabel}>TODAY</div>
          <div style={styles.bannerDateNum}>{today.getDate().toString().padStart(2, '0')}</div>
          <div style={styles.bannerDateMonth}>{today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
          <div style={styles.bannerDateYear}>{today.getFullYear()}</div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          STATS ROW
      ════════════════════════════════════════ */}
      {!isCustomer && (
        <div style={styles.statsShell}>
          <div style={styles.statsGrid}>
            {[
              { title: 'Total Volume',     value: stats.totalBookings    || 0,                              icon: renderAppIcon('totalBookings', { size: 18 }), color: 'teal' },
              { title: 'Confirmed Events', value: stats.confirmedBookings || 0,                             icon: renderAppIcon('check', { size: 18 }), color: 'teal' },
              { title: 'Pending Review',   value: stats.pendingBookings   || 0,                             icon: renderAppIcon('pending', { size: 18 }), color: 'teal' },
              { title: 'Total Revenue',    value: `$${(stats.totalRevenue || 0).toLocaleString()}`,         icon: renderAppIcon('revenue', { size: 18 }), color: 'teal' },
            ].map((s, i) => (
              <StatCard key={i} title={s.title} value={s.value} icon={s.icon} color={s.color} />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SUMMARY GRID
      ════════════════════════════════════════ */}
      <div style={{ ...styles.summaryGrid, marginBottom: '16px' }}>
        {[
          { value: halls.filter(h => h.isAvailable).length.toString().padStart(2,'0'),            label: 'Available Venues', icon: 'halls' },
          { value: vehicles.filter(v => v.isAvailable).length.toString().padStart(2,'0'), label: 'Fleet Ready',     icon: 'fleet' },
          { value: isCustomer ? '01' : (stats.confirmedBookings || 0).toString().padStart(2,'0'),  label: 'Active Bookings',  icon: 'check' },
          { value: '100%',                                                                          label: 'Service Uptime',   icon: 'uptime' },
        ].map((s, i) => (
          <div key={i} style={styles.summaryCard}>
            <div style={{ color: 'var(--color-primary)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
              {renderAppIcon(s.icon, { size: 24 })}
            </div>
            <div style={styles.summaryValue}>{s.value}</div>
            <div style={styles.summaryLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TODAY'S EVENTS SPOTLIGHT
      ════════════════════════════════════════ */}
      {!isCustomer && todayEvents.length > 0 && (
        <div style={styles.todayBanner}>
          <div style={styles.todayLeft}>
            <div style={{ position: 'relative', width: '12px', height: '12px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: '3px', backgroundColor: '#d97706', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#fcd34d', borderRadius: '50%', opacity: 0.5 }} />
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#d97706', letterSpacing: '1.2px', textTransform: 'uppercase' }}>LIVE TODAY</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>{todayEvents.length} Active</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
            {todayEvents.slice(0, 3).map(event => {
              const et = EVENT_TYPES[getEventType(event)];
              return (
                <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', border: '1px solid #fde68a', borderRadius: '8px', padding: '5px 10px' }}>
                  {renderAppIcon(et.icon, { size: 16, color: et.color })}
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>{event.eventName}</span>
                  <span style={{ ...styles.badge, backgroundColor: et.bg, color: et.color, fontSize: '9px', padding: '2px 6px' }}>{et.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          QUALITY ALERTS
      ════════════════════════════════════════ */}
      {!isCustomer && qualityAlerts.length > 0 && (
        <div style={{ ...styles.card, borderLeft: '4px solid var(--color-error)', marginBottom: '16px', padding: '12px 16px' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{renderAppIcon('warning', { size: 18, color: 'var(--color-error)', style: { marginRight: '8px', verticalAlign: 'text-bottom' } })} Operational Alerts</h2>
            <span style={styles.alertCount}>{qualityAlerts.length} unread</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {qualityAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} style={styles.alertItem}>
                <div style={styles.alertLeft}>
                  <div style={styles.alertDot} />
                  <span style={styles.alertText}>{alert.message}</span>
                </div>
                <button style={styles.dismissBtn} onClick={() => dismissAlert(alert.id)}>Dismiss</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MAIN GRID
      ════════════════════════════════════════ */}
      <div style={styles.mainGrid}>

        {/* ── LEFT COLUMN ── */}
        <div style={styles.leftCol}>

          {!isCustomer ? (
            <>
              {/* Event Type Breakdown */}
              <div>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Event Mix</h2>
                  <Link to="/bookings" style={styles.viewAllLink}>All bookings →</Link>
                </div>
                <div style={styles.eventTypeGrid}>
                  {Object.entries(EVENT_TYPES).map(([key, t]) => (
                    <div key={key} style={{ ...styles.eventTypeCard, backgroundColor: t.bg, borderColor: `${t.color}22` }}>
                      <div style={{ color: t.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{renderAppIcon(t.icon, { size: 20 })}</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: t.color }}>{eventTypeCounts[key]}</div>
                      <div style={{ fontSize: '8px', fontWeight: '700', color: t.color, textTransform: 'uppercase' }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events Timeline */}
              <div>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Upcoming Events</h2>
                </div>
                <div style={{ ...styles.card, padding: '12px 16px' }}>
                  {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map((booking, idx) => {
                    const et   = EVENT_TYPES[getEventType(booking)];
                    const days = daysUntil(booking.eventDate);
                    return (
                      <div key={booking._id} style={{ display: 'flex', gap: '16px', padding: '10px 0', alignItems: 'flex-start', borderBottom: idx < 2 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: et.color, flexShrink: 0 }} />
                          {idx < 2 && (
                            <div style={{ width: 0, flex: 1, borderLeft: `2px dashed ${et.color}33`, marginTop: '4px', minHeight: '16px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ ...styles.badge, backgroundColor: et.bg, color: et.color, fontSize: '10px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {renderAppIcon(et.icon, { size: 10 })} {et.label}
                              </span>
                              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>{booking.eventName}</h3>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{renderAppIcon('calendar', { size: 12 })} {new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                {booking.customerName && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>· {renderAppIcon('user', { size: 12 })} {booking.customerName}</span>}
                                {booking.guestCount   && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>· {renderAppIcon('drivers', { size: 12 })} {booking.guestCount} guests</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                              <CountdownBadge days={days} />
                              <StatusBadge status={booking.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={styles.emptyState}>
                      <div style={{ color: 'var(--color-text-light)', marginBottom: '10px' }}>{renderAppIcon('bookings', { size: 32 })}</div>
                      <p style={styles.emptyTitle}>No upcoming events scheduled.</p>
                      <p style={styles.emptyText}>Create a booking to see your event timeline here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Bookings */}
              <div>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Recent Bookings</h2>
                  <Link to="/bookings" style={styles.viewAllLink}>View all →</Link>
                </div>
                <div style={{ ...styles.card, padding: '12px 16px' }}>
                  {recentBookings.slice(0, 3).length > 0 ? recentBookings.slice(0, 3).map((booking, idx) => {
                    const et = EVENT_TYPES[getEventType(booking)];
                    return (
                      <div key={booking._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: idx < 2 ? '1px solid var(--color-border)' : 'none' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: et.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {renderAppIcon(et.icon, { size: 14, color: et.color })}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '2px' }}>{booking.eventName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                            {new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {booking.customerName ? ` · ${booking.customerName}` : ''}
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                    );
                  }) : (
                    <div style={styles.emptyState}>
                      <div style={{ color: 'var(--color-text-light)', marginBottom: '8px' }}>{renderAppIcon('bookings', { size: 28 })}</div>
                      <p style={styles.emptyText}>No recent bookings to display.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── HORIZONTAL TOOLS GRID ── */}
              <div style={styles.bottomHorizontalGrid}>
                {/* Admin Control / Quick Access */}
                <div style={{ ...styles.card, padding: '12px', borderColor: 'rgba(13,148,136,0.14)', background: 'linear-gradient(180deg, rgba(240,253,250,0.9) 0%, rgba(255,255,255,0.98) 100%)' }}>
                  <div style={styles.cardLabel}>Quick Access</div>
                  <div style={styles.quickGridHorizontal}>
                    {quickActions.map(action => (
                      <Link key={action.path} to={action.path} style={styles.quickItemHorizontal}>
                        <div style={{ color: 'var(--color-primary)' }}>{renderAppIcon(action.icon, { size: 18 })}</div>
                        <span style={styles.quickLabelHorizontal}>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Asset Integrity */}
                <div style={{ ...styles.card, padding: '12px', borderColor: 'rgba(13,148,136,0.14)', background: 'linear-gradient(180deg, rgba(240,253,250,0.9) 0%, rgba(255,255,255,0.98) 100%)' }}>
                  <div style={styles.cardLabel}>Asset Integrity</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Inventory</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text)' }}>{rentals.length + vehicles.length} Assets</div>
                    </div>
                    <button style={{ ...styles.manageBtn, padding: '4px 8px', fontSize: '11px' }} onClick={() => navigate('/rentals/inventory')}>Manage</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.12)' }}>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>MAINTENANCE</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)' }}>
                        {rentals.filter(r => r.maintenance?.status === 'scheduled').length + vehicles.filter(v => v.condition === 'maintenance').length}
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.10)' }}>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>DAMAGES</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)' }}>
                        {rentals.filter(r => r.damageReport).length}
                      </div>
                    </div>
                  </div>
                  <Link to="/rentals/damage-report" style={{ display: 'block', marginTop: '8px', fontSize: '11px', fontWeight: '600', color: 'var(--color-primary-dark)', textDecoration: 'none' }}>
                    Incident Reports →
                  </Link>
                </div>

                {/* System Status */}
                <div style={{ ...styles.card, padding: '12px' }}>
                  <div style={styles.cardLabel}>System Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text)' }}>Operational</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--color-success)', fontWeight: '700' }}>100% OK</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[{ label: 'API', ok: true }, { label: 'Pay', ok: true }, { label: 'Disk', ok: true }].map(s => (
                      <div key={s.label} style={{ flex: 1, padding: '6px 2px', backgroundColor: s.ok ? 'var(--color-success-light)' : 'var(--color-error-light)', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', fontWeight: '700', color: s.ok ? 'var(--color-success)' : 'var(--color-error)' }}>{s.label}</div>
                        <div style={{ fontSize: '8px', color: s.ok ? 'var(--color-success)' : 'var(--color-error)', opacity: 0.8 }}>● OK</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── CUSTOMER VIEW ── */
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Plan Your Event</h2>
              </div>
              <div style={styles.customerCardGrid}>
                {[
                  { to: '/bookings/new', icon: 'bookings', title: 'Book a Venue',   desc: 'Select from premium halls and reserve your date instantly.',        cta: 'Get Started →' },
                  { to: '/catering',    icon: 'utensilsCrossed', title: 'Plan Your Menu',  desc: 'Customise catering with our one-dish compliant food planner.',       cta: 'Explore Menu →' },
                  { to: '/halls',       icon: 'halls', title: 'Browse Halls',    desc: 'Discover our curated collection of banquet halls and event spaces.', cta: 'View Venues →' },
                  { to: '/bookings',    icon: 'layoutGrid', title: 'My Bookings',     desc: 'Track events, review confirmations, and manage your schedule.',      cta: 'View Bookings →' },
                ].map(card => (
                  <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
                    <div style={styles.customerActionCard}>
                      <div style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>{renderAppIcon(card.icon, { size: 26 })}</div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text)', margin: '0 0 6px 0' }}>{card.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-light)', lineHeight: 1.5, margin: '0 0 auto 0', flex: 1 }}>{card.desc}</p>
                      <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '12px', display: 'block' }}>{card.cta}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>{renderAppIcon('sparkles', { size: 32 })}</div>
                  <p style={styles.emptyTitle}>Your journey begins here.</p>
                  <p style={styles.emptyText}>Once you book a venue, your event progress will appear here.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.rightCol}>

          <MiniCalendar bookings={recentBookings} />

          {!isCustomer && halls.length > 0 && <VenueAvailability halls={halls} />}

          {/* ════════════════════════════════════════
              ADMIN ACCESS CONTROL
          ════════════════════════════════════════ */}
          {!isCustomer && user.role === 'admin' && (
            <div style={{ ...styles.card, borderTop: '3px solid var(--color-primary)', padding: '16px', background: 'linear-gradient(180deg, rgba(240,253,250,0.95) 0%, rgba(255,255,255,1) 100%)' }}>
              <div style={styles.cardLabel}>Access Console</div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-light)', lineHeight: 1.5, marginBottom: '16px' }}>
                Configure system permissions, role assignments, and oversee the master user directory.
              </p>
              <Link to="/admin/access-control" style={styles.consoleBtn}>
                {renderAppIcon('userManagement', { size: 16, style: { marginRight: '8px' } })} Enter Management
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */
const styles = {
  container  : { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  mainGrid   : { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '16px' },
  leftCol    : { display: 'flex', flexDirection: 'column', gap: '22px' },
  rightCol   : { display: 'flex', flexDirection: 'column', gap: '18px' },

  /* Banner */
  banner        : { position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #115e59 100%)', padding: '20px 24px', borderRadius: '18px', color: 'white', marginBottom: '20px', boxShadow: '0 10px 28px rgba(15,118,110,0.22)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', border: '1px solid rgba(255,255,255,0.12)' },
  bannerLeft    : { flex: 1, position: 'relative', zIndex: 1 },
  bannerEyebrow : { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', opacity: 0.8, marginBottom: '10px', textTransform: 'uppercase' },
  eyebrowDot    : { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5eead4' },
  bannerTitle   : { fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.6px', lineHeight: 1.1 },
  bannerSub     : { fontSize: '14px', opacity: 0.88, margin: '0 0 14px 0', maxWidth: '520px', lineHeight: 1.5 },
  bannerBadgeRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  bannerBadge   : { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: '600' },
  bannerDateBox : { position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: '16px', padding: '12px 18px', textAlign: 'center', minWidth: '90px' },
  bannerDateLabel: { fontSize: '8px', fontWeight: '800', opacity: 0.7, letterSpacing: '1.5px', marginBottom: '2px' },
  bannerDateNum : { fontSize: '28px', fontWeight: '900', lineHeight: 1, marginBottom: '2px' },
  bannerDateMonth: { fontSize: '10px', fontWeight: '700', opacity: 0.8, letterSpacing: '0.5px' },
  bannerDateYear: { fontSize: '10px', fontWeight: '600', opacity: 0.55, marginTop: '2px' },

  /* Stats */
  statsShell       : { background: 'linear-gradient(135deg, rgba(240,253,250,0.92) 0%, rgba(255,255,255,0.98) 100%)', padding: '16px', borderRadius: '20px', boxShadow: 'var(--color-card-shadow)', border: '1px solid rgba(13,148,136,0.18)', marginBottom: '16px' },
  statsGrid        : { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },

  /* Today spotlight */
  todayBanner : { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)', border: '1px solid rgba(13,148,136,0.18)', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', boxShadow: '0 6px 18px rgba(13,148,136,0.08)' },
  todayLeft   : { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },

  /* Alerts */
  sectionHeader : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  sectionTitle  : { fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', margin: 0, letterSpacing: '-0.2px' },
  viewAllLink   : { fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' },
  alertCount    : { fontSize: '12px', fontWeight: '700', color: 'var(--color-error)', backgroundColor: 'var(--color-error-light)', padding: '2px 10px', borderRadius: '20px' },
  alertItem     : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' },
  alertLeft     : { display: 'flex', alignItems: 'center', gap: '10px' },
  alertDot      : { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-error)', flexShrink: 0 },
  alertText     : { fontSize: '12px', fontWeight: '600', color: 'var(--color-text)' },
  dismissBtn    : { padding: '3px 10px', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },

  /* Card */
  card      : { backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', boxShadow: 'var(--color-card-shadow)', border: '1px solid var(--color-border)' },
  cardLabel : { fontSize: '11px', fontWeight: '700', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: '12px' },

  /* Badge */
  badge : { padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize', whiteSpace: 'nowrap' },

  /* Event type grid */
  eventTypeGrid : { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' },
  eventTypeCard : { padding: '10px 8px', borderRadius: '12px', border: '1px solid', textAlign: 'center' },

  /* Empty state */
  emptyState : { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', textAlign: 'center' },
  emptyTitle : { fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px' },
  emptyText  : { fontSize: '13px', color: 'var(--color-text-light)' },

  /* Customer cards */
  customerCardGrid  : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  customerActionCard: { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: '160px' },

  /* Calendar */
  calendarGrid : { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' },
  calWeekday   : { fontSize: '9px', fontWeight: '700', color: 'var(--color-text-light)', padding: '5px 0', opacity: 0.6 },
  calDay       : { fontSize: '11px', padding: '8px 0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' },
  calNavBtn    : { width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' },
  legendItem   : { display: 'flex', alignItems: 'center', gap: '6px' },
  legendText   : { fontSize: '10px', color: 'var(--color-text-light)' },

  /* Venue */
  venueRow  : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--color-border)' },
  venueName : { fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', flex: 1, paddingRight: '10px' },

  /* Horizontal Tools Grid (Bottom of Left Col) */
  bottomHorizontalGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' },
  
  /* Horizontal Quick Access */
  quickGridHorizontal : { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  quickItemHorizontal : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 6px', backgroundColor: 'rgba(13,148,136,0.06)', borderRadius: '12px', border: '1px solid rgba(13,148,136,0.14)', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  quickLabelHorizontal: { fontSize: '8px', fontWeight: '700', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' },

  /* Asset / manage */
  manageBtn : { padding: '6px 14px', backgroundColor: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.16)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: 'var(--color-primary-dark)' },

  /* Console */
  consoleBtn: { display: 'block', padding: '12px 24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', textDecoration: 'none', letterSpacing: '0.5px', boxShadow: '0 12px 24px rgba(13,148,136,0.18)' },

  /* Summary grid — mirrors VendorSourcing exactly */
  summaryGrid : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  summaryCard : { backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '14px', boxShadow: 'var(--color-card-shadow)', textAlign: 'center', border: '1px solid var(--color-border)' },
  summaryValue: { fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.4px' },
  summaryLabel: { fontSize: '12px', color: 'var(--color-text-light)', marginTop: '3px', lineHeight: 1.35 },

  /* Spinner */
  spinner : { width: '40px', height: '40px', border: '3px solid var(--color-primary-100)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
};

export default Dashboard;
