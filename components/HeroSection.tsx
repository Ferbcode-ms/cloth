import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  const stats = [
    { number: "200+", label: "International Brands" },
    { number: "2,000+", label: "High-Quality Products" },
    { number: "30,000+", label: "Happy Customers" },
  ];

  return (
    <section className="relative w-full bg-muted/60 overflow-hidden sm:px-16 px-4 ">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          {/* Left Section - Text Content */}
          <div className="relative z-10">
            {/* Decorative Star - Top Left */}
            <div className="absolute -top-4 -left-4 w-8 h-8 opacity-20">
              <Sparkles className="w-full h-full text-foreground" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-tighter mb-6">
              FIND CLOTHES
              <br />
              THAT MATCHES
              <br />
              YOUR STYLE
            </h1>

            {/* Description */}
            <p className="text-base md:text-sm font-medium text-muted-foreground mb-8 max-w-lg">
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense
              of style.
            </p>

            {/* Shop Now Button */}
            <Button
              asChild
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-12 py-6 text-base font-medium mb-12 md:mb-10"
            >
              <Link href="/products">Shop Now</Link>
            </Button>

            {/* Statistics */}
            <div className="flex flex-wrap items-start gap-6 md:gap-8 lg:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col relative">
                  <span className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                    {stat.number}
                  </span>
                  <span className="text-sm md:text-md font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  {index < stats.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-0 h-16 w-px bg-border -mr-4 lg:-mr-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Models */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Decorative Star - Top Right */}
            <div className="absolute top-8 right-8 w-12 h-12 opacity-20 z-10">
              <Sparkles className="w-full h-full text-foreground" />
            </div>

            {/* Models Container */}
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl my-10 sm:my-0">
              <div className="relative flex items-center justify-center">
                {/* Woman Model - Front, Left */}
                <div className="relative z-20 w-[200px] md:w-[240px] lg:w-[380px]">
                  <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-muted shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=80"
                      alt="Woman model"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>

                {/* Man Model - Back, Right */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
