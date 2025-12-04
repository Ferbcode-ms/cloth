export default function BrandBanner() {
  const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

  return (
    <section className="w-full bg-black py-8 md:py-12 overflow-hidden">
      <div className="relative">
        {/* Marquee Container */}
        <div className="flex animate-marquee hover:pause">
          {/* First set of brands */}
          <div className="flex items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-6 lg:px-8 shrink-0">
            {brands.map((brand, index) => (
              <div
                key={`first-${index}`}
                className="text-white font-bold text-xl md:text-2xl lg:text-3xl tracking-wide uppercase whitespace-nowrap"
              >
                {brand}
              </div>
            ))}
          </div>
          
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-6 lg:px-8 shrink-0">
            {brands.map((brand, index) => (
              <div
                key={`second-${index}`}
                className="text-white font-bold text-xl md:text-2xl lg:text-3xl tracking-wide uppercase whitespace-nowrap"
              >
                {brand}
              </div>
            ))}
          </div>
          
          {/* Third set for extra smooth transition */}
          <div className="flex items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 md:px-6 lg:px-8 shrink-0">
            {brands.map((brand, index) => (
              <div
                key={`third-${index}`}
                className="text-white font-bold text-xl md:text-2xl lg:text-3xl tracking-wide uppercase whitespace-nowrap"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
