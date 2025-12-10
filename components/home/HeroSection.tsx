"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function HeroSection({ sliders = [] }: { sliders?: any[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Use provided sliders or fallback to defaults if strictly needed, 
  // but better to just use provided sliders if available.
  // If no sliders from DB, we can show nothing or default.
  // Let's use default if DB is empty to prevent broken UI during transition.
  const defaultImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1678884399113-0a2b079a31f5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "DISCOVER YOUR STYLE",
      description: "Explore our latest collection of premium fashion",
      link: "/products"
    },
    {
       imageUrl: "https://images.unsplash.com/photo-1577992414733-c6b4892c1543?q=80&w=1946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
       title: "SUMMER COLLECTION",
       description: "Light and breezy styles for the perfect summer",
       link: "/products"
    },
    {
       imageUrl: "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
       title: "NEW ARRIVALS",
       description: "Check out the latest trends this season",
       link: "/products"
    },
  ];

  const displaySliders = sliders && sliders.length > 0 ? sliders : defaultImages;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full px-0">
        {/* Carousel Section */}
        <div className="relative w-full animate-in fade-in duration-1000">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {displaySliders.map((slide, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="relative w-full h-[500px] sm:h-[600px] md:h-[600px] lg:h-[650px] overflow-hidden bg-muted">
                    <Image
                      src={slide.imageUrl || slide.url} // Handle both db structure and legacy structure
                      alt={slide.title || slide.alt || "Slider Image"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* Gradient overlay for better text contrast if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                    
                    {/* Text and Shop Now Button Overlay - Now inside the loop to be dynamic per slide */}
                    <div className="absolute top-1/3 left-10 sm:bottom-20 sm:left-20 z-10 pointer-events-none">
                        {/* Headline */}
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {(slide.title || "DISCOVER YOUR STYLE").split(" ").slice(0, 1)}
                        <br />
                        {(slide.title || "DISCOVER YOUR STYLE").split(" ").slice(1).join(" ")}
                        </h2>
                        
                        {/* Subtext */}
                        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 sm:max-w-md max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ">
                        {slide.description || "Explore our latest collection of premium fashion"}
                        </p>
                        
                        {/* Button */}
                        <Button
                        asChild
                        size="lg"
                        className="pointer-events-auto bg-white text-black hover:bg-white/90 rounded-none sm:px-8 px-4 sm:py-6 py-3 text-md font-medium shadow-none transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4 delay-500"
                        >
                        <Link href={slide.link || "/products"}>Shop Now</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Left Side Shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none z-[5]" />
          
          {/* Right Side Shadow */}
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black/40 via-black/20 to-transparent pointer-events-none z-[5]" />
          
          {/* Slide Indicators - Right Bottom */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 flex gap-2">
            {displaySliders.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
       
        </div>
      </div>
    </section>
  );
}
