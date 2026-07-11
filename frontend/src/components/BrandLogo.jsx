import { LOGO_IMG } from "@/lib/content";

export default function BrandLogo({ size = 36, className = "" }) {
  return (
    <div
      className={`shrink-0 rounded-full bg-[#F9F5EE] overflow-hidden flex items-center justify-center ring-1 ring-[#C8860A]/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={LOGO_IMG} alt="Ranthambore Safari Curator logo" className="w-full h-full object-cover" />
    </div>
  );
}
