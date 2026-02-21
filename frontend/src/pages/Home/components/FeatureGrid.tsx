import type { ReactNode } from "react";
import { Scissors, Ratio, Film } from "lucide-react";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
}

function FeatureItem({ icon, title }: FeatureItemProps) {
  return (
    <div className="text-center p-2 md:p-4">
      <div className="flex justify-center mb-1 md:mb-2 text-[#3b82f6]">
        {icon}
      </div>
      <p className="text-xs md:text-sm text-[#888888]">{title}</p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 select-none">
      <FeatureItem icon={<Scissors className="w-6 h-6 md:w-7 md:h-7" />} title="Recorte preciso" />
      <FeatureItem icon={<Ratio className="w-6 h-6 md:w-7 md:h-7" />} title="Aspect Ratio" />
      <FeatureItem icon={<Film className="w-6 h-6 md:w-7 md:h-7" />} title="Suporte a GIF" />
    </div>
  );
}
