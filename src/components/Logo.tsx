import Image from "next/image";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="NF Supplements"
      width={size}
      height={size}
      style={{ borderRadius: "50%" }}
    />
  );
}
