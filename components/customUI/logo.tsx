// components/logo.tsx
import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative m-auto w-24 md:w-28 justify-center items-center flex">
      <div className="absolute -inset-2 rounded-full bg-white/20 backdrop-blur-sm"></div>
      <div className="relative">
        <Image
          src="/images/county.png"
          width={459}
          height={444}
          alt="County Logo"
          className="drop-shadow-lg"
        />
      </div>
    </div>
  );
}
