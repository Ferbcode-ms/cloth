"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle2 } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  rating: number;
  text: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-15 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
      >
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl ml-4 sm:ml-0 md:text-5xl font-bold text-textPrimary uppercase">
            OUR HAPPY CUSTOMERS
          </h2>
          <div className="hidden md:flex gap-2">
            <CarouselPrevious className="static translate-x-0 translate-y-0" />
            <CarouselNext className="static translate-x-0 translate-y-0" />
          </div>
        </div>
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem
              key={testimonial._id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="h-full shadow-md">
                <CardContent className="p-6">
                  <StarRating rating={testimonial.rating} />
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-textPrimary text-lg">
                      {testimonial.name}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-textPrimary leading-relaxed">
                    {testimonial.text}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex md:hidden justify-center gap-2 mt-6">
          <CarouselPrevious className="static translate-x-0 translate-y-0" />
          <CarouselNext className="static translate-x-0 translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}
