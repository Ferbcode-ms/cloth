"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
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
      <Card className="relative aspect-square w-full overflow-hidden rounded-xl border-0 bg-muted/30 flex items-center justify-center">
        <span className="text-muted-foreground">No Image Available</span>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="absolute right-4 top-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </Badge>
        </div>
        <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
          <div className="flex touch-pan-y">
            {images.map((src, index) => (
              <div className="relative flex-[0_0_100%] min-w-0 pl-0 aspect-[3/5] sm:aspect-square" key={index}>
                <Image
                  src={src}
                  alt={`${title} - View ${index + 1}`}
                  fill
                  className="object-cover"
                  
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div ref={thumbsRef} className="overflow-hidden">
          <div className="flex gap-3 touch-pan-y p-1">
            {images.map((src, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative flex-[0_0_20%] min-w-0 aspect-square rounded-md overflow-hidden border-2 transition-all",
                  index === selectedIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
