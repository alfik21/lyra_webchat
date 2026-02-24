import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Heart, 
  Target, 
  Users, 
  Rocket,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../sections/Footer';

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    icon: Heart,
    title: 'Pasja',
    description: 'Tworzymy Lyra z miłością do technologii i pragnienia pomagania innym.',
    color: '#ff73c3',
  },
  {
    icon: Target,
    title: 'Cel',
    description: 'Demokratyzacja dostępu do sztucznej inteligencji dla każdego Polaka.',
    color: '#c41e3a',
  },
  {
    icon: Users,
    title: 'Społeczność',
    description: 'Budujemy społeczność użytkowników, którzy dzielą się pomysłami i feedbackiem.',
    color: '#8b5cf6',
  },
  {
    icon: Rocket,
    title: 'Innowacja',
    description: 'Ciągle rozwijamy Lyra, dodając nowe funkcje i możliwości.',
    color: '#06b6d4',
  },
];

const stats = [
  { value: '10K+', label: 'Użytkowników' },
  { value: '1M+', label: 'Rozmów' },
  { value: '99%', label: 'Zadowolonych' },
  { value: '24/7', label: 'Dostępność' },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Hero animation
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll('.animate-in'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    // Content animation
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll('.content-section');
      sections.forEach((section) => {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(section, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
            });
          },
          once: true,
        });
        triggers.push(trigger);
      });
    }

    // Stats counter animation
    if (statsRef.current) {
      const trigger = ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from(statsRef.current!.querySelectorAll('.stat-item'), {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });
      triggers.push(trigger);
    }

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black to-black" />
          <div className="absolute top-0 left-0 w-full h-full">
            <img
              src="/images/about.jpg"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="animate-in text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            O <span className="text-[#ff73c3]">LYRA</span>
          </h1>
          <p className="animate-in text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Tworzymy przyszłość komunikacji człowiek-AI. 
            Z pasją, z myślą o Tobie.
          </p>
          <div className="animate-in mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff73c3] text-black font-bold text-lg rounded-full hover:bg-[#ff9dd4] transition-colors"
            >
              Rozpocznij czat
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[#ff73c3] mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={contentRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="content-section opacity-0 translate-y-8 mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Nasza <span className="text-[#ff73c3]">misja</span>
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Lyra powstała z wizji stworzenia asystenta AI, który naprawdę rozumie 
                  użytkowników. Wierzymy, że sztuczna inteligencja powinna być dostępna 
                  dla każdego, bez barier językowych i technologicznych.
                </p>
                <p className="text-white/70 text-lg leading-relaxed">
              Łączymy zaawansowaną technologię z ludzkim podejściem, oferując narzędzie, 
                  które pomaga w codziennych zadaniach, pracy i twórczości. Lyra to nie 
                  tylko chatbot - to Twój inteligentny partner w cyfrowym świecie.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10">
                  <img
                    src="/images/hero-bg.jpg"
                    alt="Lyra Technology"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#ff73c3] rounded-full blur-3xl opacity-50" />
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="content-section opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              Nasze <span className="text-[#ff73c3]">wartości</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${value.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: value.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
            Dlaczego <span className="text-[#ff73c3]">Lyra</span>?
          </h2>
          <div className="space-y-4">
            {[
              'Stworzona z myślą o polskich użytkownikach',
              'Zaawansowana technologia AI',
              'Bezpłatny dostęp bez ukrytych opłat',
              'Brak reklam i zakłóceń',
              'Pełne wsparcie dla języka polskiego',
              'Ciągły rozwój i nowe funkcje',
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <CheckCircle className="w-6 h-6 text-[#ff73c3] flex-shrink-0" />
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Dołącz do nas
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Przekonaj się sam, jak Lyra może ułatwić Ci życie. 
              Rozpocznij rozmowę teraz - za darmo, bez rejestracji.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff73c3] text-black font-bold text-lg rounded-full hover:bg-[#ff9dd4] transition-colors"
              >
                <Rocket className="w-5 h-5" />
                Uruchom czat
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors"
              >
                Zobacz funkcje
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
