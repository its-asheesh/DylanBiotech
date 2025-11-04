// src/components/ImpressiveCarousel.tsx
import React, { useState, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import type { CarouselItem } from "../../types/carousel";
import { useReducedMotion } from "../../hooks/carouselHooks/useReducedMotion";
import { getGradientColor } from "../../lib/utils";
import { GlobalStyles } from "@mui/material";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ImpressiveCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  className?: string;
  height?: string;
}

const ImpressiveCarousel: React.FC<ImpressiveCarouselProps> = ({
  items,
  autoPlay = true,
  showNavigation = true,
  showPagination = true,
  className = "",
  height = "h-96",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const swiperRef = useRef<any>(null);

  const handleSlideChange = useCallback((swiper: any) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  // Render each slide as a proper component to safely use motion
  const SlideContent: React.FC<{ item: CarouselItem; isActive: boolean }> = ({
    item,
    isActive,
  }) => {
    if (item.type === "image") {
      return (
        <motion.img
          src={item.src}
          alt={item.alt || "Carousel image"}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
          initial={reducedMotion ? false : { scale: 0.95, opacity: 0 }}
          animate={
            reducedMotion ? {} : { scale: isActive ? 1.03 : 1, opacity: 1 }
          }
          transition={
            reducedMotion ? {} : { type: "spring", stiffness: 300, damping: 20 }
          }
        />
      );
    }

    if (item.type === "video") {
      const [muted, setMuted] = useState(true);
      return (
        <video
          src={item.src}
          muted={muted}
          autoPlay={isActive}
          playsInline
          loop
          onClick={() => setMuted(!muted)}
          className="w-full h-full object-cover rounded-lg cursor-pointer"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    // Text or Banner
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-6 text-center h-full rounded-lg text-white"
        style={{
          background: `linear-gradient(135deg, ${getGradientColor(item.id)})`,
          backgroundSize: "200% 200%",
        }}
        initial={reducedMotion ? false : { y: 30, opacity: 0 }}
        animate={
          reducedMotion
            ? {}
            : {
                y: 0,
                opacity: 1,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }
        }
        transition={
          reducedMotion
            ? {}
            : {
                y: { duration: 0.6, delay: 0.1 },
                opacity: { duration: 0.6, delay: 0.1 },
                backgroundPosition: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                },
              }
        }
      >
        {item.title && (
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-3"
            initial={reducedMotion ? false : { y: 20, opacity: 0 }}
            animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {item.title}
          </motion.h3>
        )}
        <motion.p
          className="text-lg md:text-xl max-w-2xl"
          initial={reducedMotion ? false : { y: 20, opacity: 0 }}
          animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {item.text}
        </motion.p>
      </motion.div>
    );
  };

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className} ${height}`}>
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={items.length > 1}
        autoplay={
          autoPlay && items.length > 1
            ? { delay: 6000, disableOnInteraction: false }
            : false
        }
        navigation={showNavigation && items.length > 1} // ✅ Let Swiper handle arrows
        pagination={
          showPagination && items.length > 1
            ? { clickable: true, dynamicBullets: true }
            : false
        }
        onSlideChange={handleSlideChange}
        className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
        role="region"
        aria-label="Featured content carousel"
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={item.id}
            className="flex items-center justify-center p-2"
          >
            <div className="w-full h-full flex items-center justify-center">
              <SlideContent item={item} isActive={index === activeIndex} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Optional: Custom arrow styling via CSS (Swiper auto-injects buttons when navigation=true) */}
      <GlobalStyles
        styles={{
          ".swiper-button-next, .swiper-button-prev": {
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#6366f1",
              color: "white",
              transform: "scale(1.1)",
            },
            "&::after": {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "black",
            },
            "&:hover::after": {
              color: "white",
            },
          },
          ".swiper-pagination-bullet": {
            width: "12px",
            height: "12px",
            margin: "0 4px",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            transition: "all 0.3s",
          },
          ".swiper-pagination-bullet-active": {
            width: "24px",
            backgroundColor: "#6366f1",
            transform: "scale(1.1)",
            boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
          },
        }}
      />
    </div>
  );
};

export default ImpressiveCarousel;
