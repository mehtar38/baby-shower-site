export default function DecorativeElements() {
  return (
    <>
      {/* Top-left cloud */}
      <div className="absolute top-16 left-10 w-24 h-12 opacity-20">
        <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
          <path fill="#8a4af5" d="M20,20 Q30,10 40,20 T70,20 Q80,10 90,20 T100,20 L100,30 Q90,40 80,30 T50,30 T20,30 Z" />
        </svg>
      </div>

      {/* Bottom-right stars */}
      <div className="absolute bottom-24 right-16 opacity-30">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-4 h-4 text-[#8a4af5]">
              ★
            </div>
          ))}
        </div>
      </div>

      {/* Center flower (subtle) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 opacity-10">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="10" fill="#8a4af5" />
          <circle cx="30" cy="40" r="6" fill="#8a4af5" />
          <circle cx="70" cy="40" r="6" fill="#8a4af5" />
          <circle cx="50" cy="70" r="6" fill="#8a4af5" />
        </svg>
      </div>
    </>
  );
}