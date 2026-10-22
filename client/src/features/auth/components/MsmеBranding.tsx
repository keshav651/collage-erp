
interface MsmeBrandingProps {
  compact?: boolean;
}

export default function MsmeBranding({
  compact = false,
}: MsmeBrandingProps) {
  return (
    <div className={`text-center text-[#921B25] ${compact ? "space-y-1" : "space-y-2"}`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#921B25]/20 text-3xl">
        <span aria-hidden="true">✦</span>
      </div>

      <h1 className="text-3xl font-black tracking-[0.12em] sm:text-4xl">
        MSME
      </h1>

      <p className="text-[10px] font-bold tracking-wide sm:text-xs">
        MICRO, SMALL &amp; MEDIUM ENTERPRISES
      </p>

      <p className="text-xs font-semibold">
        सूक्ष्म, लघु एवं मध्यम उद्यम
      </p>

      <p className="text-xs font-semibold">
        Ministry of MSME, Govt. of India
      </p>
    </div>
  );
}
