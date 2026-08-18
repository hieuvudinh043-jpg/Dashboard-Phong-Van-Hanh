export default function MetricCard({ title, value, trend, trendValue, icon, delay }) {
  const isPositive = trend === 'up';
  
  return (
    <div className={`glass-card animate-fade-in`} style={{ padding: '1.5rem', animationDelay: delay }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>{title}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>{value}</h2>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span style={{ 
          color: isPositive ? 'var(--success)' : 'var(--danger)',
          background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {isPositive ? '↑' : '↓'} {trendValue}
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>so với hôm qua</span>
      </div>
    </div>
  );
}
