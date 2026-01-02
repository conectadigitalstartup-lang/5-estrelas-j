import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SliderExample {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  label: string;
}

interface BeforeAfterSliderProps {
  examples: SliderExample[];
}

const BeforeAfterSlider = ({ examples }: BeforeAfterSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentExample = examples[currentIndex];

  // Auto-advance carousel every 5 seconds when not dragging
  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length);
      setSliderPosition(50); // Reset slider position on change
    }, 5000);

    return () => clearInterval(interval);
  }, [isDragging, examples.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
    setSliderPosition(50);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
    setSliderPosition(50);
  };

  const getPositionFromEvent = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return 50;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    },
    []
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setSliderPosition(getPositionFromEvent(e.clientX));
  }, [getPositionFromEvent]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setSliderPosition(getPositionFromEvent(e.clientX));
    },
    [isDragging, getPositionFromEvent]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      setSliderPosition(getPositionFromEvent(e.touches[0].clientX));
    },
    [getPositionFromEvent]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setSliderPosition(getPositionFromEvent(e.touches[0].clientX));
    },
    [isDragging, getPositionFromEvent]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Slider */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-lg overflow-hidden cursor-ew-resize select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Before Image (Bottom Layer - Full) */}
        <img
          src={currentExample.beforeImage}
          alt={currentExample.beforeAlt}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          draggable={false}
        />

        {/* After Image (Top Layer - Clipped) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={currentExample.afterImage}
            alt={currentExample.afterAlt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            draggable={false}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />

          {/* Handle Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white/50">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-navy"
            >
              <path
                d="M8 12L4 8M4 8L8 4M4 8H11M16 12L20 16M20 16L16 20M20 16H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels - After is on LEFT (clipped layer), Before is on RIGHT (base layer) */}
        <div
          className="absolute top-3 left-3 z-20 transition-opacity duration-200 pointer-events-none"
          style={{ opacity: sliderPosition > 20 ? 1 : 0 }}
        >
          <span className="text-xs text-white bg-coral/90 backdrop-blur-sm px-2.5 py-1 rounded font-medium">
            ✨ DEPOIS
          </span>
        </div>
        <div
          className="absolute top-3 right-3 z-20 transition-opacity duration-200 pointer-events-none"
          style={{ opacity: sliderPosition < 80 ? 1 : 0 }}
        >
          <span className="text-xs text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded font-medium">
            📱 ANTES
          </span>
        </div>

        {/* Dish Label */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-sm text-white bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full font-medium">
            {currentExample.label}
          </span>
        </div>

        {/* Instruction - only shows when not interacting */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 pointer-events-none ${
            isDragging ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="text-xs text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
            👆 Arraste para comparar
          </span>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Carousel Dots */}
      <div className="flex items-center justify-center gap-2">
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setSliderPosition(50);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-secondary w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir para exemplo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
