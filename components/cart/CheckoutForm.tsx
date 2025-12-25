"use client";

import { useState, useRef, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { getCart, clearCart } from "@/lib/utils/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { State, City } from "country-state-city";
import { z } from "zod";

interface CheckoutFormProps {
  recaptchaSiteKey: string;
}

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Pincode must be exactly 6 digits"),
});

type ValidationErrors = {
  [key in keyof typeof checkoutSchema.shape]?: string;
};

export default function CheckoutForm({ recaptchaSiteKey }: CheckoutFormProps) {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  
  // State for location handling
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const states = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    return selectedStateCode ? City.getCitiesOfState("IN", selectedStateCode) : [];
  }, [selectedStateCode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    // Validate form data
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof ValidationErrors;
        formattedErrors[path] = issue.message;
      });
      setFieldErrors(formattedErrors);
      setLoading(false);
      return;
    }

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
    // Clear error when user starts typing
    if (fieldErrors[e.target.name as keyof ValidationErrors]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleStateChange = (value: string) => {
    const selectedState = states.find((s) => s.isoCode === value);
    if (selectedState) {
      setSelectedStateCode(value);
      setFormData((prev) => ({
        ...prev,
        state: selectedState.name,
        city: "", // Reset city when state changes
      }));
      setFieldErrors((prev) => ({ ...prev, state: undefined, city: undefined }));
    }
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));
    setFieldErrors((prev) => ({ ...prev, city: undefined }));
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
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={fieldErrors.name ? "border-red-500" : ""}
            />
            {fieldErrors.name && (
              <span className="text-xs text-red-500 mt-1">{fieldErrors.name}</span>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone" className="uppercase text-xs">
              Phone Number *
            </FieldLabel>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={fieldErrors.phone ? "border-red-500" : ""}
              maxLength={10}
            />
            {fieldErrors.phone && (
              <span className="text-xs text-red-500 mt-1">{fieldErrors.phone}</span>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="email" className="uppercase text-xs">
              Email *
            </FieldLabel>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && (
              <span className="text-xs text-red-500 mt-1">{fieldErrors.email}</span>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="address" className="uppercase text-xs">
              Delivery Address *
            </FieldLabel>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                fieldErrors.address ? "border-red-500" : ""
              }`}
              placeholder="Enter your complete delivery address"
            />
            {fieldErrors.address && (
              <span className="text-xs text-red-500 mt-1">{fieldErrors.address}</span>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="state" className="uppercase text-xs">
                State *
              </FieldLabel>
              <Select onValueChange={handleStateChange} value={selectedStateCode}>
                <SelectTrigger className={fieldErrors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.state && (
                <span className="text-xs text-red-500 mt-1">{fieldErrors.state}</span>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="city" className="uppercase text-xs">
                City *
              </FieldLabel>
              <Select 
                onValueChange={handleCityChange} 
                value={formData.city} 
                disabled={!selectedStateCode}
              >
                <SelectTrigger className={fieldErrors.city ? "border-red-500" : ""}>
                  <SelectValue placeholder={selectedStateCode ? "Select City" : "Select State First"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.city && (
                <span className="text-xs text-red-500 mt-1">{fieldErrors.city}</span>
              )}
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
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              maxLength={6}
              className={fieldErrors.pincode ? "border-red-500" : ""}
            />
            {fieldErrors.pincode && (
              <span className="text-xs text-red-500 mt-1">{fieldErrors.pincode}</span>
            )}
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
