// src/components/ImmersiveCategorySlide.tsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/carouselHooks/useReducedMotion";
import { GlobalStyles } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CategoryItem } from "@/types/category";

import "swiper/css";
import "swiper/css/navigation";


interface ImmersiveCategorySlideProps {
  items: CategoryItem[];
  autoPlay?: boolean;
  showNavigation?: boolean;
  className?: string;
  title?: string;
}

const ImmersiveCategorySlide: React.FC<ImmersiveCategorySlideProps> = ({
  items,
  autoPlay = true,
  showNavigation = true,
  className = "",
  title,
}) => {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  if (!items.length) return null;

  // Detect mobile (for compact view)
  const isMobile = window.innerWidth < 768;

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 px-4 tracking-tight"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
      )}

      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={isMobile ? 12 : 24}
        slidesPerView="auto"
        loop={items.length > (isMobile ? 2 : 3)}
        autoplay={
          autoPlay && items.length > (isMobile ? 2 : 3)
            ? { delay: isMobile ? 3000 : 5000, disableOnInteraction: false }
            : false
        }
        navigation={showNavigation && items.length > (isMobile ? 2 : 3)}
        className="px-4 py-2"
        role="region"
        aria-label={title ? `${title} collection` : "Shop by category"}
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={item.id}
            style={{ width: isMobile ? "180px" : "300px" }}
            className="!flex !items-center !justify-center"
          >
            <motion.div
              onClick={() => navigate(item.href)}
              className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
              style={{ height: isMobile ? "240px" : "420px" }}
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={!isMobile && !reducedMotion ? { y: -10 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background Image */}
              <motion.img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                animate={reducedMotion ? {} : { scale: 1.05 }}
                whileHover={!isMobile && !reducedMotion ? { scale: 1.15 } : {}}
                transition={{ duration: 0.8 }}
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 ${
                  isMobile
                    ? "bg-gradient-to-t from-black/60 to-transparent"
                    : "bg-gradient-to-t from-black/70 via-transparent to-transparent"
                }`}
              />

              {/* Content */}
              <div className={`absolute bottom-0 left-0 p-4 w-full ${isMobile ? "pb-3" : "pb-6"}`}>
                {/* Icon with color shift */}
                {item.icon && (
                  <motion.div
                    className="inline-block mb-2 md:mb-3"
                    whileHover={!isMobile && !reducedMotion ? { scale: 1.2 } : {}}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: "text-white drop-shadow-md",
                    })}
                  </motion.div>
                )}

                {/* Name */}
                <motion.h3
                  className={`font-light text-white ${
                    isMobile ? "text-lg leading-tight" : "text-2xl leading-tight"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {item.name}
                </motion.h3>

                {/* Description (hide on mobile if too long) */}
                {item.description && !isMobile && (
                  <motion.p
                    className="text-sm text-white/85 mt-1 font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {item.description}
                  </motion.p>
                )}

                {/* Sparkle Particle on Hover (desktop only) */}
                {!isMobile && !reducedMotion && (
                  <AnimatePresence>
                    <motion.div
                      className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </AnimatePresence>
                )}

                {/* Shine underline */}
                <motion.div
                  className="mt-2 h-0.5 bg-white/50 w-8 origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={!isMobile && !reducedMotion ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 🌌 Glass-morphism Navigation */}
      <GlobalStyles
        styles={{
          ".swiper-button-next, .swiper-button-prev": {
            width: isMobile ? "36px" : "44px",
            height: isMobile ? "36px" : "44px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#fff",
            transition: "all 0.3s ease",
            zIndex: 10,
          },
          ".swiper-button-next:hover, .swiper-button-prev:hover": {
            background: "rgba(255, 255, 255, 0.3)",
            transform: "scale(1.05)",
          },
          ".swiper-button-next::after, .swiper-button-prev::after": {
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: "600",
          },
        }}
      />
    </div>
  );
};

export default ImmersiveCategorySlide;