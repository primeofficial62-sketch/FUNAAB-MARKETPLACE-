import { ShoppingBag } from "lucide-react";

export default function Splash() {
  return (
    <div className="splash" aria-hidden="true">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="ripple" style={{ animationDelay: ".2s" }} />
        <span className="ripple" style={{ animationDelay: ".55s" }} />
        <span className="ripple" style={{ animationDelay: ".9s" }} />
        <div className="bg-brand logo-pop relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl shadow-emerald-900/30">
          <ShoppingBag className="h-11 w-11 text-white" strokeWidth={2.2} />
        </div>
      </div>
      <p
        className="fade-up mt-6 text-lg font-extrabold tracking-tight text-emerald-900"
        style={{ animationDelay: ".5s" }}
      >
        FUNAAB <span className="text-brand">Marketplace</span>
      </p>
    </div>
  );
}
