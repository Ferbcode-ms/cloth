export default function BrandBanner() {
  const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

  return (
    <section className="w-full bg-black py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 xl:gap-20">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="text-white font-bold text-xl md:text-2xl lg:text-3xl tracking-wide"
              style={{
                fontFamily:
                  brand === "Calvin Klein"
                    ? "system-ui, -apple-system, sans-serif"
                    : "serif",
              }}
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
