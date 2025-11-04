import React from "react";
import ImpressiveCarousel from "../components/carousal/AnimatedCarousel";
import type { CarouselItem } from "../types/carousel";
import { Layout } from "@/components/layout/Layout";

import {
  Shirt,
  Footprints,
  Watch,
  Sparkle,
  TrendingUp,
  Star,
} from "lucide-react";
import ImmersiveCategorySlide from "@/components/categories/CategorySlide";

const HomePage: React.FC = () => {
  const items: CarouselItem[] = [
    {
      id: 1,
      type: "image",
      src: "/image1.jpeg",
      alt: "AI-powered diagnostics lab",
    },
    {
      id: 2,
      type: "image",
      src: "/image2.jpeg",
    },
    {
      id: 3,
      type: "banner",
      title: "Precision Medicine, Redefined",
      text: "Leveraging genomic data and machine learning to personalize treatment plans.",
    },
    {
      id: 4,
      type: "text",
      title: "Trusted by Leading Hospitals",
      text: '"DylanBiotech cut our diagnostic time by 70%." – Johns Hopkins Medical Team',
    },
  ];

  const categories = [
    {
      id: 1,
      name: "Women",
      description: "Spring '25 Collection",
      image: "/categories/women.jpg",
      icon: <Shirt size={32} className="text-white drop-shadow-lg" />,
    },
    {
      id: 2,
      name: "Men",
      description: "Tailored Elegance",
      image: "/categories/men.jpg",
      icon: <TrendingUp size={32} className="text-white drop-shadow-lg" />,
    },
    {
      id: 3,
      name: "Footwear",
      description: "Step in Style",
      image: "/categories/shoes.jpg",
      icon: <Footprints size={32} className="text-white drop-shadow-lg" />,
    },
    {
      id: 4,
      name: "Accessories",
      description: "Finishing Touches",
      image: "/image1.jpeg",
      icon: <Watch size={32} className="text-white drop-shadow-lg" />,
    },
    {
      id: 5,
      name: "New Arrivals",
      description: "Just Landed",
      image: "/image2.jpeg",
      icon: <Sparkle size={32} className="text-white drop-shadow-lg" />,
    },
    {
      id: 6,
      name: "Editor's Picks",
      description: "Curated Luxury",
      image: "/categories/picks.jpg",
      icon: <Star size={32} className="text-white drop-shadow-lg" />,
    },
  ];

  return (
    <Layout surfaceHeight={80}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* <header className="py-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">DylanBiotech</h1>
        <p className="mt-2 text-gray-600">Innovating the future of healthcare</p>
      </header> */}

        <main className="max-w-8xl mx-auto px-2 pb-12">
          <section>
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Discover Our Platform</h2> */}
            <ImpressiveCarousel
              items={items}
              autoPlay={true}
              showNavigation={true}
              showPagination={true}
              height="h-[500px]"
            />
          </section>

           {/* ✅ Category Slide - NOW USED */}
          <section>
            <ImmersiveCategorySlide
            title="Discover the Collections"
            items={categories}
            autoPlay={true}
            showNavigation={true}
          />
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default HomePage;
