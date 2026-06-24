import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PredictSection from "@/components/PredictSection";
import GenderCategories from "@/components/GenderCategory";
import ProductPanel from "@/components/ProductPanel";
import PredictionPanel from "@/components/PredictionPanel";
import ResultsPanel from "@/components/ResultsPanel";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <FloatingBackground />
      <Navbar />
      <Hero />
      <PredictSection />
      <GenderCategories />
      <ProductPanel />
      <PredictionPanel />
      <ResultsPanel />
      <Footer />
    </>
  );
}
