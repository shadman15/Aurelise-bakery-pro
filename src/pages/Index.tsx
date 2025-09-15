import HeroCarousel from "../components/HeroCarousel";
import SignatureCreations from "../components/SignatureCreations";
import WhyChooseUs from "../components/WhyChooseUs";
import PreOrderNotice from "../components/PreOrderNotice";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <SignatureCreations />
      <WhyChooseUs />
      <PreOrderNotice />
    </div>
  );
};

export default Index;
