import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { heroConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    const title = titleRef.current;
    if (!section || !grid || !title) return;

    // Set loaded state for initial animations
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);

    // Get all grid cells
    const cells = grid.querySelectorAll('.grid-cell');
    const titleBlocks = title.querySelectorAll('.title-block');

    // Initial entrance animation
    const tl = gsap.timeline({ delay: 0.3 });

    // Grid cells flip in with stagger
    tl.fromTo(
      cells,
      {
        rotateX: 90,
        y: -100,
        opacity: 0,
      },
      {
        rotateX: 0,
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: {
          each: 0.05,
          from: 'random',
        },
        ease: 'expo.out',
      }
    );

    // Title blocks decode animation
    tl.fromTo(
      titleBlocks,
      {
        scale: 0,
        rotate: 180,
        opacity: 0,
      },
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      },
      '-=0.5'
    );

    // Scroll-based parallax
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    scrollTl.to(grid, {
      y: 150,
      ease: 'none',
    });

    scrollTl.to(
      title,
      {
        x: -200,
        ease: 'none',
      },
      0
    );

    if (scrollTl.scrollTrigger) {
      triggersRef.current.push(scrollTl.scrollTrigger);
    }

    return () => {
      clearTimeout(loadTimer);
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, []);

  if (!heroConfig.titleLine1 && !heroConfig.titleLine2) return null;

  const rows = heroConfig.gridRows || 6;
  const cols = heroConfig.gridCols || 8;

  // Generate grid cells
  const generateGridCells = () => {
    const cells = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isPink = heroConfig.pinkCells.some((p) => p.row === row && p.col === col);
        const cellIndex = row * cols + col;

        cells.push(
          <div
            key={cellIndex}
            className={`grid-cell absolute preserve-3d backface-hidden transition-all duration-300 hover:scale-105 hover:z-10 ${
              isPink ? 'bg-pink' : ''
            }`}
            style={{
              left: `${(col / cols) * 100}%`,
              top: `${(row / rows) * 100}%`,
              width: `${100 / cols}%`,
              height: `${100 / rows}%`,
              backgroundImage: isPink ? 'none' : heroConfig.backgroundImage ? `url(${heroConfig.backgroundImage})` : 'none',
              backgroundPosition: `${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              transformOrigin: 'center center',
            }}
            data-cursor-hover
          />
        );
      }
    }
    return cells;
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-black overflow-hidden perspective-1000"
    >
      {/* Grid container */}
      <div
        ref={gridRef}
        className="absolute inset-0 preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {generateGridCells()}
      </div>

      {/* Title overlay */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      >
        <div className="relative w-full max-w-6xl px-6">
          {/* Title Line 1 */}
          {heroConfig.titleLine1 && (
            <div className="flex justify-start mb-4">
              <div className="title-block bg-pink px-8 py-4 pointer-events-auto hover:scale-110 transition-transform duration-300">
                <span className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-black tracking-tighter">
                  {heroConfig.titleLine1}
                </span>
              </div>
            </div>
          )}

          {/* Title Line 2 */}
          {heroConfig.titleLine2 && (
            <div className="flex justify-end">
              <div className="title-block bg-pink px-8 py-4 pointer-events-auto hover:scale-110 transition-transform duration-300">
                <span className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-black tracking-tighter">
                  {heroConfig.titleLine2}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle */}
      {heroConfig.subtitle && (
        <div className="absolute bottom-32 left-0 right-0 text-center z-20">
          <p className="font-body text-white/60 text-sm md:text-base uppercase tracking-[0.3em]">
            {heroConfig.subtitle}
          </p>
        </div>
      )}

      {/* CTA Button */}
      {heroConfig.ctaText && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-20">
          <a
            href={heroConfig.ctaHref || '#products'}
            className="group flex items-center gap-3 px-8 py-4 border-2 border-pink text-pink font-display font-bold text-sm uppercase tracking-wider hover:bg-pink hover:text-black transition-all duration-300"
            data-cursor-hover
          >
            {heroConfig.ctaText}
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
          </a>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-24 left-6 w-16 h-16 border-l-2 border-t-2 border-pink/30 z-20" />
      <div className="absolute bottom-24 right-6 w-16 h-16 border-r-2 border-b-2 border-pink/30 z-20" />

      {/* Loading overlay */}
      <div
        className={`absolute inset-0 bg-black z-50 transition-opacity duration-700 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </section>
  );
};

export default Hero;
