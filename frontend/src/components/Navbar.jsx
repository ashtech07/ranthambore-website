import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { MapPin, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteImage } from "@/lib/siteImages";

const links = [
  { to: "/safari-booking", label: "Safari Booking" },
  { to: "/hotels", label: "Hotels" },
  { to: "/packages", label: "Packages" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ transparentOnTop = true }) {
  const [scrolled, setScrolled] = useState(!transparentOnTop);
  const [open, setOpen] = useState(false);
  const logo = useSiteImage("logo");

  useEffect(() => {
    if (!transparentOnTop) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  return (
    <header
      data-testid="site-navbar"
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300 backdrop-blur-[2px]",
        scrolled ? "bg-[#1A2B1F]/95 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt="Ranthambore Safari Curator logo" className="w-10 h-10 rounded-full object-cover shadow-md" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#C8860A] flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          <div className="leading-tight">
            <div className="font-serif text-white text-lg sm:text-xl font-bold">
              Ranthambore Safari Curator
            </div>
            <div className="text-[10px] tracking-[0.28em] text-[#C8860A] uppercase">
              Ranthambore
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-white/90 hover:text-[#C8860A] transition-colors",
                  isActive && "text-[#C8860A]"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/safari-booking"
            data-testid="nav-book-now"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#C8860A] hover:bg-[#a86f08] text-white font-semibold text-sm transition-colors"
          >
            Book Now
          </Link>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden text-white p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          data-testid="mobile-drawer"
          className="fixed inset-0 z-50 bg-[#1A2B1F] text-white flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="font-serif text-xl">Menu</span>
            <button
              data-testid="mobile-menu-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-6 py-8 gap-5 text-2xl font-serif">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link
              to="/safari-booking"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex justify-center px-6 py-3 rounded-full bg-[#C8860A] text-white text-base"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
