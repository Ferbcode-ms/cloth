import Link from "next/link";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";

const companyLinks = [
  { name: "About", href: "#" },
  { name: "Features", href: "#" },
  { name: "Works", href: "#" },
  { name: "Career", href: "#" },
];

const helpLinks = [
  { name: "Customer Support", href: "#" },
  { name: "Delivery Details", href: "#" },
  { name: "Terms & Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

const faqLinks = [
  { name: "Account", href: "#" },
  { name: "Manage Deliveries", href: "#" },
  { name: "Orders", href: "#" },
  { name: "Payments", href: "#" },
];

const resourcesLinks = [
  { name: "Free eBooks", href: "#" },
  { name: "Development Tutorial", href: "#" },
  { name: "How to - Blog", href: "#" },
  { name: "Youtube Playlist", href: "#" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-muted/60 overflow-hidden">
      <div className="container mx-auto px-8 sm:px-6 lg:px-16 py-8 lg:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-8">
          {/* Left Column - Brand Info */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary uppercase mb-4">
              SHOP.CO
            </h2>
            <p className="text-sm font-medium text-muted-foreground mb-6 leading-relaxed max-w-sm">
              We have clothes that suits your style and which you're proud to
              wear. From women to men.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="h-10 w-10 rounded-full border-2 border-textPrimary flex items-center justify-center hover:bg-textPrimary hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Columns - Navigation Links */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* COMPANY */}
            <div>
              <h3 className="font-bold  text-textPrimary uppercase mb-4 text-sm">
                COMPANY
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-textPrimary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* HELP */}
            <div>
              <h3 className="font-bold text-textPrimary uppercase mb-4 text-sm">
                HELP
              </h3>
              <ul className="space-y-3">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-textPrimary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-bold text-textPrimary uppercase mb-4 text-sm">
                FAQ
              </h3>
              <ul className="space-y-3">
                {faqLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-textPrimary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* RESOURCES */}
            <div>
              <h3 className="font-bold text-textPrimary uppercase mb-4 text-sm">
                RESOURCES
              </h3>
              <ul className="space-y-3">
                {resourcesLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-textPrimary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="items-center gap-4">
          {/* Copyright */}
          <p className="text-sm font-medium text-muted-foreground  md:text-left text-center">
            Shop.co© Made by{" "}
            <span className="font-bold text-textPrimary">Ferbcode.ms</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
