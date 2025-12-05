"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function HeroSection() {
  const stats = [
    { number: "200+", label: "International Brands" },
    { number: "2,000+", label: "High-Quality Products" },
    { number: "30,000+", label: "Happy Customers" },
  ];

  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      alt: "Fashion Collection 1",
    },
    {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      alt: "Fashion Collection 2",
    },
    {
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
      alt: "Fashion Collection 3",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full px-0">
        {/* Carousel Section */}
        <div className="relative w-full animate-in fade-in duration-1000">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="relative w-full h-[500px] sm:h-[600px] md:h-[600px] lg:h-[650px] overflow-hidden bg-muted">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* Gradient overlay for better text contrast if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Text and Shop Now Button Overlay */}
          <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 z-10 pointer-events-none">
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              DISCOVER
              <br />
              YOUR STYLE
            </h2>
            
            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Explore our latest collection of premium fashion
            </p>
            
            {/* Button */}
            <Button
              asChild
              size="lg"
              className="pointer-events-auto bg-white text-black hover:bg-white/90 rounded-none sm:px-8 px-6 sm:py-6 py-4 text-lg font-semibold shadow-none transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4 delay-500"
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>

          {/* Left Side Shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none z-[5]" />
          
          {/* Right Side Shadow */}
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black/40 via-black/20 to-transparent pointer-events-none z-[5]" />
       
        </div>
      </div>
    </section>
  );
}
