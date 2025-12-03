import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-12 text-center">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              We'd love to hear from you. Please fill out the form or visit us at our store.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Our Location</h3>
                <p className="text-muted-foreground">
                  123 Fashion Street<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Phone className="w-6 h-6" />
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6" />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">hello@shop.co</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                id="name"
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                id="email"
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                id="message"
                rows={4}
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
