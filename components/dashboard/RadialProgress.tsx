interface RadialProgressProps {
  percent: number  // 0-100
  size?: number    // default 64
}

export default function RadialProgress({ percent, size = 64 }: RadialProgressProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(78,205,196,0.12)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4ECDC4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: `${size * 0.22}px`,
        fontWeight: 700,
        color: '#4ECDC4',
        position: 'relative',
        zIndex: 1,
      }}>
        {percent}%
      </span>
    </div>
  )
}
