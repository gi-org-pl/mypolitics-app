import bannerDesktop from "@/assets/images/promotions/banner-desktop.png";
import bannerMobile from "@/assets/images/promotions/banner-mobile.png";
import bannerTablet from "@/assets/images/promotions/banner-tablet.png";
import { PromotionBanner } from "@/components/shared/PromotionBanner/PromotionBanner";
import type { Promotion } from "@/components/shared/PromotionBanner/PromotionBanner.types";

const promotions: Promotion[] = [
  {
    name: "Dołącz do kampanii myPolitics",
    url: "https://mypolitics.pl",
    date: {
      start: new Date("2026-01-01T00:00:00.000Z"),
      end: new Date("2026-12-31T23:59:59.999Z"),
    },
    imageUrl: {
      mobile: bannerMobile,
      tablet: bannerTablet,
      desktop: bannerDesktop,
    },
  },
];

const Index = () => {
  return (
    <div>
      <span>mypolitics</span>
      <PromotionBanner promotions={promotions} />
    </div>
  );
};

export default Index;
