"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    axis: "y",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    if (thumbsApi) thumbsApi.scrollTo(emblaApi.selectedScrollSnap());
  }, [emblaApi, thumbsApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-muted/20 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full">
      {/* Thumbnails - Hidden on mobile, vertical on desktop */}
      {images.length > 1 && (
        <div className="hidden lg:block lg:w-20 xl:w-24">
          <div ref={thumbsRef} className="overflow-hidden h-full max-h-[600px]">
            <div className="flex flex-col gap-3">
              {images.map((src, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "relative aspect-square rounded-sm overflow-hidden transition-all duration-300 group cursor-pointer",
                    index === selectedIndex
                      ? "opacity-100"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 relative">
        {/* Image Counter Badge - Mobile only */}
        {images.length > 1 && (
          <div className="absolute right-3 top-3 z-10 lg:hidden">
            <div className="px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium border border-border/50">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {/* Zoom Icon */}
        <div className="absolute left-3 top-3 z-10 hidden lg:block">
          <div className="p-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/50">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Main Carousel */}
        <div className="relative overflow-hidden rounded-sm bg-muted/10">
          <div 
            ref={emblaRef} 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <div className="flex touch-pan-y">
              {images.map((src, index) => (
                <div 
                  className="relative flex-[0_0_100%] min-w-0 aspect-square lg:aspect-[4/5]" 
                  key={index}
                >
                  <Image
                    src={src}
                    alt={`${title} - View ${index + 1}`}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500 ease-out",
                      isZoomed && "lg:scale-102"
                    )}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Thumbnails - Horizontal at bottom */}
        {images.length > 1 && (
          <div className="mt-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((src, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden transition-all duration-300",
                    index === selectedIndex
                      ? " opacity-100"
                      : "opacity-50"
                  )}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dots Indicator - Desktop only */}
        {images.length > 1 && (
          <div className="hidden lg:flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex
                    ? "w-8 bg-foreground"
                    : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}