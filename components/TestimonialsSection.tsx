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

const testimonials = [
  {
    name: "Ethan R.",
    verified: true,
    rating: 5,
    text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
  },
  {
    name: "Olivia P.",
    verified: true,
    rating: 5,
    text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
  },
  {
    name: "Liam K.",
    verified: true,
    rating: 5,
    text: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
  },
  {
    name: "Samantha D.",
    verified: true,
    rating: 5,
    text: "I absolutely love unique designs, and this t-shirt exceeded my expectations. As a fellow designer, I appreciate the attention to detail. This has become my go-to shirt for both casual and semi-formal occasions.",
  },
  {
    name: "Michael T.",
    verified: true,
    rating: 5,
    text: "Outstanding quality and design! The fabric feels premium and the fit is perfect. This t-shirt has quickly become one of my favorites in my wardrobe.",
  },
];

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

export default function TestimonialsSection() {
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
          <h2 className="text-3xl ml-4 sm:ml-0 md:text-5xl font-extrabold text-textPrimary uppercase">
            OUR HAPPY CUSTOMERS
          </h2>
          <div className="hidden md:flex gap-2">
            <CarouselPrevious className="static translate-x-0 translate-y-0" />
            <CarouselNext className="static translate-x-0 translate-y-0" />
          </div>
        </div>
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="h-full shadow-md">
                <CardContent className="p-6">
                  <StarRating rating={testimonial.rating} />
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-textPrimary">
                      {testimonial.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
