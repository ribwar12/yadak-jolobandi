import { CartDrawer } from "@/components/layout/cart-drawer/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/header";
import { MobileNav } from "@/components/layout/header/mobile-nav";
import { MarketVolatilityAlert } from "@/components/layout/market-volatility-alert";
import { CarSelectorModal } from "@/components/storefront/car-selector/car-selector-modal";

export default function StorefrontLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="print:hidden">
        <MarketVolatilityAlert />
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden">
        <Footer />
        <CartDrawer />
        <MobileNav />
        <CarSelectorModal />
      </div>
    </div>
  );
}
