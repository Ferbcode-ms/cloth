import React from "react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
      <div className="prose prose-lg mx-auto text-muted-foreground">
        <p className="mb-6">
          Welcome to SHOP.CO, your number one source for all things fashion. We're dedicated to providing you the very best of clothing, with an emphasis on quality, style, and comfort.
        </p>
        <p className="mb-6">
          Founded in 2024, SHOP.CO has come a long way from its beginnings. When we first started out, our passion for eco-friendly fashion drove us to start our own business.
        </p>
        <p>
          We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
        </p>
      </div>
    </div>
  );
}
