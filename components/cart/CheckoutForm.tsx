"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { getCart, clearCart } from "@/lib/utils/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  recaptchaSiteKey: string;
}

export default function CheckoutForm({ recaptchaSiteKey }: CheckoutFormProps) {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cart = getCart();
    if (cart.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      const token = recaptchaRef.current?.getValue();
      if (!token) {
        throw new Error("Please verify that you are not a robot");
      }

      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        customer: formData,
        recaptchaToken: token,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        recaptchaRef.current?.reset();
        throw new Error(data.error || "Failed to create order");
      }

      clearCart();
      router.push(`/checkout/success?orderId=${data.order.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false); // Stop loading on error
    } 
    // Do not stop loading on success to prevent UI flicker before redirect
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="border rounded-sm p-6">
      <h2 className="text-xl sm:text-2xl font-medium mb-2 uppercase">
        Delivery Information
      </h2>
      <p className="text-sm text-foreground/60 mb-6">
        Please provide your details for delivery
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name" className="uppercase text-xs">
              Full Name *
            </FieldLabel>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone" className="uppercase text-xs">
              Phone Number *
            </FieldLabel>
            <Input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email" className="uppercase text-xs">
              Email (Optional)
            </FieldLabel>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="address" className="uppercase text-xs">
              Delivery Address *
            </FieldLabel>
            <textarea
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Enter your complete delivery address"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="city" className="uppercase text-xs">
                City *
              </FieldLabel>
              <Input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="state" className="uppercase text-xs">
                State *
              </FieldLabel>
              <Input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="pincode" className="uppercase text-xs">
              Pincode *
            </FieldLabel>
            <Input
              type="text"
              id="pincode"
              name="pincode"
              required
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              maxLength={6}
            />
          </Field>

          <div className="pt-4">
             {recaptchaSiteKey && (
              <div className="mb-4">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  theme="light"
                />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full rounded h-12 text-base font-medium bg-foreground text-background hover:opacity-90 uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order (COD)"
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
