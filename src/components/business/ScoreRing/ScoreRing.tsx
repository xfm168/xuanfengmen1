import './ScoreRing.css'

export interface ScoreRingProps {
  score: number
  label?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export default function ScoreRing({
  score,
  label = '玄风指数',
  size = 120,
  strokeWidth = 8,
  className = '',
}: ScoreRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ

  const classes = ['xbiz-score-ring', className].filter(Boolean).join(' ')

  return (
    <div className={classes} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="xbiz-score-ring__svg">
        <defs>
          <linearGradient id="xbiz-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#E8C56A" />
          </linearGradient>
          <filter id="xbiz-score-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="xbiz-score-ring__bg"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="xbiz-score-ring__fg"
          stroke="url(#xbiz-score-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          filter="url(#xbiz-score-glow)"
        />
        <text
          x={size / 2}
          y={size / 2 - 2}
          className="xbiz-score-ring__num"
          textAnchor="middle"
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          className="xbiz-score-ring__label"
          textAnchor="middle"
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
