import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  Icon: LucideIcon;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, Icon, iconColor = "text-blue-400" }) => {
  return (
    <div className="bg-[#18212F] rounded-[20px] p-5 flex flex-col justify-between h-full hover:bg-[#1E293B] transition-colors border border-white/5">
      <div className={`mb-3 ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {subValue && <p className="text-sm font-medium text-white/80">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;