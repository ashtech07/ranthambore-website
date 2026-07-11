import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, BedDouble, Package, Waves, Star, CheckCircle2, Quote } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import CallbackWidget from "@/components/CallbackWidget";
import FAQAccordion from "@/components/FAQAccordion";
import { api, waLink } from "@/lib/api";
import { useSiteImage, useSiteImages } from "@/lib/siteImages";
import {
  HERO_IMG, HERO_ALERTS, WHAT_WE_DO, ZONES, ZONE_IMAGES, HOW_IT_WORKS,
  ATTRACTIONS, ZONE_MAP_BG,
} from "@/lib/content";

const ICONS = { Compass, BedDouble, Package, Waves };

const FEATURED_ATTRACTIONS = ATTRACTIONS.filter(
  (a) => a.name === "Ranthambore Fort" || a.name === "Trinetra Ganesh Temple"
);

const ATTRACTION_SLOT = {
  "Ranthambore Fort": "attraction_fort",
  "Trinetra Ganesh Temple": "attraction_temple",
};

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const { images } = useSiteImages();
  const heroImg = useSiteImage("hero_bg", HERO_IMG);
  const tatkalBg = useSiteImage("tatkal_bg");
  useEffect(() => {
    api.get("/reviews").then(({ data }) => setReviews(data || [])).catch(() => {});
  }, []);
  return (
    <PublicLayout
      title="Ranthambore Safari Booking — Book Tiger Safari Online | Ranthambore Safari Curator"
      description="Book Ranthambore Jeep Safari, Canter Safari and Tatkal Safari online. Best prices, instant WhatsApp confirmation. Trusted booking partner for Ranthambore National Park."
    >
      {/* HERO */}
      <section data-testid="hero-section" className="relative -mt-[72px] pt-[72px] min-h-[100svh] flex items-center justify-center text-center text-white overflow-hidden">
        <img
          src={heroImg}
          alt="Bengal tiger walking through golden grass at sunrise — Ranthambore National Park"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#C8860A]/40" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-5xl px-6 py-24 fade-up">
          <span className="inline-block text-xs sm:text-sm tracking-[0.32em] uppercase text-white/80 mb-6">
            Trusted Booking Partner
          </span>
          <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">
            The Tigers Are Waiting
          </h1>
          <p className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#C8860A] mt-4">
            Are You Ready For The Ultimate Wildlife Adventure?
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center justify-center">
            <Link
              to="/safari-booking"
              data-testid="hero-book-cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C8860A] hover:bg-[#a86f08] text-white font-bold text-sm uppercase tracking-wider transition-all hover:translate-y-[-2px]"
            >
              Book Your Safari Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#explore-zones"
              data-testid="hero-zones-cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/90 text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Explore Zones
            </a>
            <a
              href={waLink("Hi! I'd like to book a Ranthambore safari. Please share availability and pricing.")}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-whatsapp-cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold text-sm uppercase tracking-wider transition-all hover:translate-y-[-2px]"
            >
              <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.36c-.27-.13-1.58-.78-1.83-.87-.25-.09-.42-.13-.6.14-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.14-.42-2.18-1.35-.81-.72-1.35-1.62-1.51-1.89-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.83-1.99-.22-.52-.45-.45-.62-.46l-.53-.01c-.18 0-.47.07-.71.34-.25.27-.94.92-.94 2.24 0 1.32.96 2.6 1.09 2.78.13.18 1.9 2.9 4.6 4.07.64.28 1.14.45 1.53.57.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.8-1.27.22-.62.22-1.16.16-1.27-.07-.11-.25-.18-.52-.31zM16 5C9.92 5 5 9.92 5 16c0 1.94.51 3.77 1.4 5.36L5 27l5.86-1.36A10.9 10.9 0 0 0 16 27c6.08 0 11-4.92 11-11S22.08 5 16 5z"/>
              </svg>
              Book Via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* LIVE ALERT TICKER */}
      <div className="bg-[#111111] text-white py-3 overflow-hidden">
        <div className="ticker-track-fast">
          <span className="px-8 text-sm">{HERO_ALERTS}</span>
          <span className="px-8 text-sm">{HERO_ALERTS}</span>
          <span className="px-8 text-sm">{HERO_ALERTS}</span>
        </div>
      </div>

      {/* WHAT WE DO */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C8860A] mb-3">What We Do</div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">One concierge, every part of your jungle.</h2>
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto">
              We started as park guides ourselves. Today we run a careful booking service for people who want the wild without the queue.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHAT_WE_DO.map((s, i) => {
              const Icon = ICONS[s.icon] || Compass;
              return (
                <div
                  key={i}
                  data-testid={`service-card-${i}`}
                  className="bg-[#F9F5EE] rounded-2xl p-8 border border-stone-200 hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A2B1F] text-[#C8860A] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl mb-2">{s.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ZONE MAP */}
      <section
        id="explore-zones"
        className="relative py-20 md:py-28 bg-[#1A2B1F] text-white overflow-hidden"
      >
        <img
          src={ZONE_MAP_BG}
          alt="Aerial view of Ranthambore National Park forest"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C8860A] mb-3">Ten Zones, Ten Stories</div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">Your zone decides your tiger.</h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Ranthambore is divided into ten safari zones — each a different mood, terrain, and resident wildlife. Zones 1 to 5 are classic, zones 6 to 10 are quieter and wilder.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {ZONES.map((z, i) => (
              <div
                key={z.id}
                data-testid={`zone-card-${z.id}`}
                className="group bg-black/30 backdrop-blur rounded-2xl overflow-hidden border border-white/10 hover:border-[#C8860A] transition-colors"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={images[`zone_${z.id}`] || ZONE_IMAGES[i]}
                    alt={`Ranthambore Zone ${z.id} ${z.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs tracking-widest text-[#C8860A] uppercase">Zone {z.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      z.difficulty === "Easy" ? "bg-green-500/20 text-green-200" :
                      z.difficulty === "Moderate" ? "bg-yellow-500/20 text-yellow-200" :
                      "bg-red-500/20 text-red-200"
                    }`}>
                      {z.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg">{z.name}</h3>
                  <p className="text-xs text-white/70 mt-1">{z.wildlife}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">From idea to e-ticket in minutes.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} data-testid={`how-step-${i}`} className="relative bg-[#F9F5EE] rounded-2xl p-8 border border-stone-200">
                <div className="font-serif text-6xl text-[#C8860A]/80 mb-3">{s.n}</div>
                <h3 className="font-serif text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TATKAL */}
      <section className="relative py-20 md:py-28 bg-[#1A2B1F] text-white overflow-hidden">
        {tatkalBg && (
          <img src={tatkalBg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs tracking-[0.3em] uppercase text-[#E63946] mb-3 bg-[#E63946]/10 px-3 py-1 rounded-full border border-[#E63946]/40">
            Tatkal · Last-Minute
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-5">Plans change. Tigers don&apos;t wait.</h2>
          <p className="text-white/80 leading-relaxed mb-6">
            The forest department releases Tatkal seats exactly one day before each safari. We monitor the window in real time and grab them the second they open.
          </p>
          <ul className="space-y-3 text-white/80 text-sm mb-8 inline-block text-left">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-[#C8860A] mt-0.5" />Window opens 9:30 AM, one day before your shift</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-[#C8860A] mt-0.5" />Higher fees, but the only way to book within 24 hours</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-[#C8860A] mt-0.5" />We hold a Tatkal queue position for you the moment you submit</li>
          </ul>
          <div>
            <Link
              to="/safari-booking#tatkal"
              data-testid="tatkal-cta"
              className="tatkal-blink inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#E63946] text-white font-bold text-sm uppercase tracking-wider"
            >
              Check Tatkal Availability <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TOURIST ATTRACTIONS */}
      <section className="py-20 md:py-28 bg-[#F9F5EE]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C8860A] mb-3">Around the Park</div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">Stories older than the tigers.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {FEATURED_ATTRACTIONS.map((a, i) => (
              <article key={i} data-testid={`attraction-${i}`} className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:-translate-y-1 transition-transform">
                <div className="h-72 overflow-hidden">
                  <img src={images[ATTRACTION_SLOT[a.name]] || a.img} alt={`${a.name} — Ranthambore tourist attraction`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="font-serif text-2xl mb-3">{a.name}</h3>
                  <p className="text-base text-stone-600 leading-relaxed">{a.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C8860A] mb-3">FAQ</div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">Everything You Want to Know About Ranthambore Safari</h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-[#1A2B1F] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.3em] uppercase text-[#C8860A] mb-3">From the Field</div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">What Our Guests Say</h2>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center text-white/70 text-lg py-10" data-testid="no-reviews">Reviews coming soon</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((t, i) => (
                <div key={t.id || i} data-testid={`testimonial-${i}`} className="bg-black/30 backdrop-blur p-8 rounded-2xl border border-white/10">
                  <Quote className="w-7 h-7 text-[#C8860A] mb-3" />
                  <p className="text-white/85 leading-relaxed text-[15px]">“{t.text}”</p>
                  <div className="flex items-center gap-1 mt-5 text-[#C8860A]">
                    {[...Array(Math.max(0, Math.min(5, Number(t.rating) || 5)))].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8860A] text-white font-serif text-lg flex items-center justify-center overflow-hidden">
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        (t.name || "G")[0]
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                    </div>
                    <span className="ml-auto text-[10px] uppercase tracking-wider bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Verified Guest</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CallbackWidget />
    </PublicLayout>
  );
}
