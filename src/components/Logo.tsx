export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#6aaa3a" />
      {/* Stem */}
      <path
        d="M50 75 C50 75 50 45 50 40"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path
        d="M50 55 C40 50 30 38 32 28 C42 30 48 42 50 55Z"
        fill="white"
      />
      {/* Right leaf */}
      <path
        d="M50 45 C60 40 70 30 68 22 C58 24 52 34 50 45Z"
        fill="white"
      />
    </svg>
  );
}
