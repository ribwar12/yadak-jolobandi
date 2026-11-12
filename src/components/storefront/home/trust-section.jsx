import { ShieldCheck, CheckCircle2, Truck, Headphones, Headset } from "lucide-react";
import { SITE_CONTENT } from "@/config/site-content";

const TRUST_ICON_MAP = {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Headphones,
  Headset,
};

export function TrustSection() {
  return (
    <section className="py-10 bg-white border-y border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {SITE_CONTENT.trustPillars.map((pillar) => {
            const IconComponent = TRUST_ICON_MAP[pillar.icon] || ShieldCheck;
            return (
              <div
                key={pillar.id}
                className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-orange-50 text-accent border border-orange-100 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
