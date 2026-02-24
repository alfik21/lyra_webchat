// ============================================================================
// SITE CONFIGURATION
// ============================================================================
// Edit this file to customize all content on your site.
// All text, images, and data are controlled from here.
// Do NOT modify component files — only edit this config.
// ============================================================================

// ----------------------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  logoAccent: string;
  navLinks: NavLink[];
  ctaText: string;
}

export const navigationConfig: NavigationConfig = {
  logo: "LYRA",
  logoAccent: ".",
  navLinks: [
    { label: "Strona główna", href: "#" },
    { label: "Funkcje", href: "#features" },
    { label: "O aplikacji", href: "#about" },
    { label: "Czat", href: "#chat" },
    { label: "Nowa strona", href: "/app" },
    { label: "Nagrywanie głosowe", href: "/voice-ui" },
    { label: "Czysty llama", href: "/chat-app" },
  ],
  ctaText: "Wypróbuj teraz",
};

// ----------------------------------------------------------------------------
// Hero Section
// ----------------------------------------------------------------------------

export interface HeroConfig {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
  gridRows: number;
  gridCols: number;
  pinkCells: { row: number; col: number }[];
}

export const heroConfig: HeroConfig = {
  titleLine1: "PRZYSZŁOŚĆ",
  titleLine2: "KOMUNIKACJI",
  subtitle: "Inteligentny czat AI, który rozumie Twoje potrzeby. Szybko, bezpiecznie i po polsku.",
  ctaText: "Rozpocznij rozmowę",
  ctaHref: "#chat",
  backgroundImage: "/images/hero-bg.jpg",
  gridRows: 6,
  gridCols: 8,
  pinkCells: [
    { row: 0, col: 2 },
    { row: 1, col: 5 },
    { row: 2, col: 0 },
    { row: 3, col: 7 },
    { row: 4, col: 3 },
    { row: 5, col: 6 },
  ],
};

// ----------------------------------------------------------------------------
// Product Showcase Section
// ----------------------------------------------------------------------------

export interface ProductFeature {
  value: string;
  label: string;
}

export interface ProductShowcaseConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  productName: string;
  description: string;
  price: string;
  features: ProductFeature[];
  colorSwatches: string[];
  colorSwatchesLabel: string;
  ctaText: string;
  productImage: string;
  productImageAlt: string;
  decorativeText: string;
}

export const productShowcaseConfig: ProductShowcaseConfig = {
  sectionLabel: "DLACZEGO LYRA?",
  headingMain: "Inteligencja, która",
  headingAccent: "słucha",
  productName: "Lyra Chat",
  description: "Lyra to nowoczesna aplikacja czatu wspierana przez sztuczną inteligencję. Rozumiej kontekst, pamięta historię rozmów i komunikuje się po polsku z naturalną płynnością.",
  price: "Za darmo",
  features: [
    { value: "24/7", label: "Dostępność" },
    { value: "∞", label: "Rozmowy" },
    { value: "PL", label: "Język polski" },
    { value: "<1s", label: "Odpowiedź" },
  ],
  colorSwatches: ["#ff73c3", "#c41e3a", "#8b5cf6", "#06b6d4"],
  colorSwatchesLabel: "Wybierz motyw",
  ctaText: "Uruchom czat",
  productImage: "/images/product.png",
  productImageAlt: "Aplikacja Lyra Chat na smartfonie",
  decorativeText: "LYRA",
};

// ----------------------------------------------------------------------------
// Color Palette Section
// ----------------------------------------------------------------------------

export interface ColorSwatch {
  name: string;
  nameSecondary: string;
  color: string;
  description: string;
}

export interface ColorPaletteConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  colors: ColorSwatch[];
  bottomText: string;
  decorativeText: string;
}

export const colorPaletteConfig: ColorPaletteConfig = {
  sectionLabel: "MOCE SPECJALNE",
  headingMain: "Funkcje, które",
  headingAccent: "wyróżniają",
  colors: [
    {
      name: "Pamięć",
      nameSecondary: "Kontekst",
      color: "#ff73c3",
      description: "Pamięta całą historię rozmowy i rozumie kontekst",
    },
    {
      name: "Szybkość",
      nameSecondary: "Błyskawica",
      color: "#c41e3a",
      description: "Odpowiada w ułamku sekundy, bez oczekiwania",
    },
    {
      name: "Polski",
      nameSecondary: "Rodzimy",
      color: "#8b5cf6",
      description: "Perfekcyjna znajomość języka polskiego i kultury",
    },
    {
      name: "Bezpieczeństwo",
      nameSecondary: "Prywatność",
      color: "#06b6d4",
      description: "Twoje dane są bezpieczne i chronione",
    },
    {
      name: "Kreatywność",
      nameSecondary: "Inspiracja",
      color: "#f59e0b",
      description: "Pomaga pisać, kodować i tworzyć pomysły",
    },
    {
      name: "Wiedza",
      nameSecondary: "Uniwersum",
      color: "#10b981",
      description: "Dostęp do ogromnej bazy wiedzy na każdy temat",
    },
  ],
  bottomText: "Kliknij dowolny kolor, aby zobaczyć więcej szczegółów",
  decorativeText: "AI",
};

// ----------------------------------------------------------------------------
// Finale / Brand Philosophy Section
// ----------------------------------------------------------------------------

export interface FinaleConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  tagline: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  decorativeText: string;
}

export const finaleConfig: FinaleConfig = {
  sectionLabel: "O APLIKACJI",
  headingMain: "Tworzymy",
  headingAccent: "przyszłość",
  tagline: "Lyra powstała z wizji stworzenia asystenta AI, który naprawdę rozumie użytkowników. Łączymy zaawansowaną technologię z ludzkim podejściem, oferując narzędzie, które pomaga w codziennych zadaniach, pracy i twórczości.",
  features: [
    "Bezpłatny dostęp",
    "Bez reklam",
    "Polski język",
    "Prywatność",
  ],
  ctaText: "Dołącz do nas",
  ctaHref: "#chat",
  image: "/images/about.jpg",
  imageAlt: "Abstrakcyjna wizja sztucznej inteligencji",
  decorativeText: "FUTURE",
};

// ----------------------------------------------------------------------------
// Footer
// ----------------------------------------------------------------------------

export interface SocialLink {
  platform: "instagram" | "twitter" | "youtube";
  href: string;
  label: string;
}

export interface FooterLinkSection {
  title: string;
  links: string[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

export interface LegalLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  logo: string;
  logoAccent: string;
  brandDescription: string;
  socialLinks: SocialLink[];
  linkSections: FooterLinkSection[];
  contact: ContactInfo;
  legalLinks: LegalLink[];
  copyrightText: string;
  decorativeText: string;
}

export const footerConfig: FooterConfig = {
  logo: "LYRA",
  logoAccent: ".",
  brandDescription: "Inteligentny czat AI po polsku. Twój osobisty asystent do pracy, nauki i twórczości.",
  socialLinks: [
    { platform: "twitter", href: "#", label: "Twitter" },
    { platform: "instagram", href: "#", label: "Instagram" },
    { platform: "youtube", href: "#", label: "YouTube" },
  ],
  linkSections: [
    {
      title: "Produkt",
      links: ["Funkcje", "Czat", "Aktualizacje", "Roadmap"],
    },
    {
      title: "Wsparcie",
      links: ["Pomoc", "FAQ", "Kontakt", "Zgłoś błąd"],
    },
    {
      title: "Firma",
      links: ["O nas", "Blog", "Kariera", "Partnerzy"],
    },
  ],
  contact: {
    address: "Warszawa, Polska",
    phone: "+48 123 456 789",
    email: "kontakt@lyra.ai",
  },
  legalLinks: [
    { label: "Polityka prywatności", href: "#" },
    { label: "Regulamin", href: "#" },
    { label: "Cookies", href: "#" },
  ],
  copyrightText: "Lyra AI. Wszelkie prawa zastrzeżone.",
  decorativeText: "LYRA",
};

// ----------------------------------------------------------------------------
// Site Metadata
// ----------------------------------------------------------------------------

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "Lyra - Inteligentny czat AI po polsku",
  description: "Lyra to nowoczesna aplikacja czatu wspierana przez sztuczną inteligencję. Rozmawiaj po polsku, szybko i bezpiecznie.",
  language: "pl",
};
