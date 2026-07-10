import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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
      <ProductPanel />
      <PredictionPanel />
      <ResultsPanel />
      <Footer />
    </>
  );
}
