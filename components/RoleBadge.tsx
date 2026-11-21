"use client";

import React from "react";
import { UserRole } from "@/frontend-exports/blockchain/types";
import { ShieldAlert, Factory, Truck, Store, UserCheck } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole | null;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RoleBadge({ role, showIcon = true, size = "md" }: RoleBadgeProps) {
  const configs: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    ADMIN: {
      label: "Regulator",
      bg: "bg-navy-900",
      text: "text-cyan-300",
      border: "border-navy-700",
      icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-cyan-400" />,
    },
    MANUFACTURER: {
      label: "Produsen Farmasi",
      bg: "bg-teal-50",
      text: "text-teal-800",
      border: "border-teal-200",
      icon: <Factory className="w-3.5 h-3.5 mr-1 text-teal-600" />,
    },
    DISTRIBUTOR: {
      label: "Distributor PBF",
      bg: "bg-amber-50",
      text: "text-amber-900",
      border: "border-amber-200",
      icon: <Truck className="w-3.5 h-3.5 mr-1 text-amber-600" />,
    },
    PHARMACY: {
      label: "Apotek Berlisensi",
      bg: "bg-emerald-50",
      text: "text-emerald-900",
      border: "border-emerald-200",
      icon: <Store className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    CONSUMER: {
      label: "Publik / Pasien",
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />,
    },
  };

  const config = role
    ? configs[role]
    : {
        label: "Peran belum tersedia",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />,
      };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs font-semibold px-2.5 py-1",
    lg: "text-sm font-bold px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-xl border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} shadow-sm`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
