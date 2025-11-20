"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "@/lib/utils/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Hash,
} from "lucide-react";

interface CheckoutFormProps {
  recaptchaSiteKey: string;
}

export default function CheckoutForm({ recaptchaSiteKey }: CheckoutFormProps) {
  const router = useRouter();
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
      // reCAPTCHA is disabled for now
      // const token = await new Promise<string>((resolve, reject) => {
      //   (window as any).grecaptcha.ready(() => {
      //     (window as any).grecaptcha
      //       .execute(recaptchaSiteKey, { action: "checkout" })
      //       .then(resolve)
      //       .catch(reject);
      //   });
      // });

      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        customer: formData,
        recaptchaToken: "", // reCAPTCHA disabled
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
        throw new Error(data.error || "Failed to create order");
      }

      clearCart();
      router.push(`/checkout/success?orderId=${data.order.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
    <Card className="">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-light">
          Delivery Information
        </CardTitle>
        <CardDescription>
          Please provide your details for delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">
                <User className="h-4 w-4 mr-2 inline" />
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
              <FieldLabel htmlFor="phone">
                <Phone className="h-4 w-4 mr-2 inline" />
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
              <FieldLabel htmlFor="email">
                <Mail className="h-4 w-4 mr-2 inline" />
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
              <FieldLabel htmlFor="address">
                <MapPin className="h-4 w-4 mr-2 inline" />
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
                <FieldLabel htmlFor="city">
                  <Building2 className="h-4 w-4 mr-2 inline" />
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
                <FieldLabel htmlFor="state">
                  <Building2 className="h-4 w-4 mr-2 inline" />
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
              <FieldLabel htmlFor="pincode">
                <Hash className="h-4 w-4 mr-2 inline" />
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
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full rounded-full h-12 text-base font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order (COD)"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
