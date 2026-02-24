import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  MessageSquare, 
  Zap, 
  Shield, 
  Brain, 
  Globe, 
  Sparkles,
  Clock,
  Lock,
  Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../sections/Footer';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Brain,
    title: 'Inteligentne odpowiedzi',
    description: 'Lyra rozumie kontekst i dostarcza trafne, pomocne odpowiedzi na Twoje pytania.',
    color: '#ff73c3',
  },
  {
    icon: Zap,
    title: 'Błyskawiczna prędkość',
    description: 'Otrzymuj odpowiedzi w ułamku sekundy, bez zbędnego oczekiwania.',
    color: '#c41e3a',
  },
  {
    icon: Languages,
    title: 'Perfekcyjny polski',
    description: 'Komunikuj się w języku polskim z naturalną płynnością i poprawnością.',
    color: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'Bezpieczeństwo danych',
    description: 'Twoje rozmowy są chronione i bezpieczne. Dbamy o Twoją prywatność.',
    color: '#06b6d4',
  },
  {
    icon: Clock,
    title: 'Dostępność 24/7',
    description: 'Lyra jest dostępna o każdej porze dnia i nocy, zawsze gotowa do pomocy.',
    color: '#f59e0b',
  },
  {
    icon: Sparkles,
    title: 'Kreatywność',
    description: 'Pomagamy pisać teksty, kodować, tworzyć pomysły i rozwiązywać problemy.',
    color: '#10b981',
  },
  {
    icon: Globe,
    title: 'Ogromna wiedza',
    description: 'Dostęp do szerokiej bazy wiedzy na temat nauki, technologii, historii i więcej.',
    color: '#ec4899',
  },
  {
    icon: Lock,
    title: 'Bez reklam',
    description: 'Korzystaj z czatu bez irytujących reklam i zakłóceń.',
    color: '#6366f1',
  },
  {
    icon: MessageSquare,
    title: 'Historia rozmów',
    description: 'Lyra pamięta kontekst rozmowy i prowadzi spójne dialogi.',
    color: '#14b8a6',
  },
];

export default function FeaturesPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.set(card, { opacity: 0, y: 50 });
        
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'power3.out',
            });
          },
          once: true,
        });
        
        triggers.push(trigger);
      }
    });

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-900/20 via-black to-black" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            FUNKCJE
            <span className="text-[#ff73c3]">.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Odkryj wszystkie możliwości, które oferuje Lyra. 
            Inteligentny czat AI stworzony z myślą o Tobie.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff73c3] text-black font-bold text-lg rounded-full hover:bg-[#ff9dd4] transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Wypróbuj teraz
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors"
            >
              Powrót
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Icon */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon 
                      className="w-7 h-7" 
                      style={{ color: feature.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ 
                      boxShadow: `0 0 40px ${feature.color}20`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Gotowy, aby spróbować?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Dołącz do tysięcy użytkowników, którzy już korzystają z Lyry. 
              Za darmo, bez rejestracji.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff73c3] text-black font-bold text-lg rounded-full hover:bg-[#ff9dd4] transition-colors"
            >
              <Zap className="w-5 h-5" />
              Rozpocznij czat
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
