export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#82aa4b" />
      {/* Soil line */}
      <ellipse cx="50" cy="72" rx="18" ry="4" fill="rgba(255,255,255,0.3)" />
      {/* Stem */}
      <path
        d="M50 72 C50 72 50 48 50 42"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M50 56 C42 52 30 42 32 30 C42 32 48 44 50 56Z"
        fill="white"
      />
      {/* Right leaf */}
      <path
        d="M50 46 C58 42 68 34 67 24 C58 26 52 36 50 46Z"
        fill="white"
      />
      {/* Small sprout leaf at top */}
      <path
        d="M50 42 C46 38 42 32 44 28 C48 30 50 36 50 42Z"
        fill="rgba(255,255,255,0.7)"
      />
    </svg>
  );
}
