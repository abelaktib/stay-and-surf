// Étoile à huit branches, la "nejma" qui donne son nom à la maison
export default function Star({ className, strokeOnly = false, ...rest }) {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 50 : 30;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" {...rest}>
      <polygon
        points={pts.join(" ")}
        fill={strokeOnly ? "none" : "currentColor"}
        stroke={strokeOnly ? "currentColor" : "none"}
        strokeWidth={strokeOnly ? 3 : 0}
        strokeLinejoin="round"
        pathLength={strokeOnly ? 1 : undefined}
      />
    </svg>
  );
}
