import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { colorPaletteConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const ColorPalette = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cards = grid.querySelectorAll('.color-card');

    // Grid line draw animation
    const lineTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    lineTl.fromTo(
      '.grid-line-h',
      { scaleX: 0 },
      { scaleX: 1, duration: 1, stagger: 0.1, ease: 'expo.out' }
    );

    lineTl.fromTo(
      '.grid-line-v',
      { scaleY: 0 },
      { scaleY: 1, duration: 1, stagger: 0.1, ease: 'expo.out' },
      0
    );

    if (lineTl.scrollTrigger) {
      triggersRef.current.push(lineTl.scrollTrigger);
    }

    // Cards flip in
    const cardsTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });

    cardsTl.fromTo(
      cards,
      {
        rotateY: 90,
        opacity: 0,
      },
      {
        rotateY: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
      }
    );

    if (cardsTl.scrollTrigger) {
      triggersRef.current.push(cardsTl.scrollTrigger);
    }

    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent, color: string, index: number) => {
    setActiveIndex(index);

    // Create particles
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }, () => ({
      id: particleIdRef.current++,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      color,
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  if (colorPaletteConfig.colors.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="palette"
      className="relative min-h-screen w-full bg-black py-24 overflow-hidden"
    >
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal lines */}
        {[0, 33.33, 66.66, 100].map((pos, i) => (
          <div
            key={`h-${i}`}
            className="grid-line-h absolute left-0 right-0 h-px bg-white/10 origin-left"
            style={{ top: `${pos}%` }}
          />
        ))}
        {/* Vertical lines */}
        {[0, 25, 50, 75, 100].map((pos, i) => (
          <div
            key={`v-${i}`}
            className="grid-line-v absolute top-0 bottom-0 w-px bg-white/10 origin-top"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          {colorPaletteConfig.sectionLabel && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-pink" />
              <span className="font-body text-pink text-sm uppercase tracking-[0.3em]">
                {colorPaletteConfig.sectionLabel}
              </span>
              <div className="w-12 h-px bg-pink" />
            </div>
          )}
          {(colorPaletteConfig.headingMain || colorPaletteConfig.headingAccent) && (
            <h2 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tight">
              {colorPaletteConfig.headingMain}<span className="text-pink">{colorPaletteConfig.headingAccent}</span>
            </h2>
          )}
        </div>

        {/* Color grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border-4 border-black"
        >
          {colorPaletteConfig.colors.map((swatch, index) => (
            <div
              key={swatch.nameSecondary}
              className={`color-card relative bg-black preserve-3d cursor-pointer group overflow-hidden ${
                activeIndex === index ? 'ring-2 ring-pink z-10' : ''
              }`}
              onClick={(e) => handleCardClick(e, swatch.color, index)}
              data-cursor-hover
            >
              {/* Color block */}
              <div
                className="aspect-square transition-transform duration-500 ease-custom-expo group-hover:scale-110"
                style={{ backgroundColor: swatch.color }}
              />

              {/* Overlay info */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <span className="font-display font-black text-xl text-white mb-1">
                  {swatch.nameSecondary}
                </span>
                <span className="font-body text-pink text-sm mb-2">
                  {swatch.name}
                </span>
                <span className="font-body text-white/60 text-xs">
                  {swatch.description}
                </span>
              </div>

              {/* Corner accent */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="fixed pointer-events-none z-50 w-4 h-4 rounded-full animate-ping"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
            }}
          />
        ))}

        {/* Bottom text */}
        {colorPaletteConfig.bottomText && (
          <div className="mt-16 text-center">
            <p className="font-body text-white/40 text-sm uppercase tracking-wider">
              {colorPaletteConfig.bottomText}
            </p>
          </div>
        )}
      </div>

      {/* Decorative text */}
      {colorPaletteConfig.decorativeText && (
        <div className="absolute bottom-0 right-0 font-display font-black text-[8rem] md:text-[15rem] text-white/[0.02] leading-none pointer-events-none select-none">
          {colorPaletteConfig.decorativeText}
        </div>
      )}
    </section>
  );
};

export default ColorPalette;
