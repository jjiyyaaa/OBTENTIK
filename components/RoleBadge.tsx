"use client";

import React from "react";
import { UserRole } from "@/frontend-exports/blockchain/types";
import { ShieldAlert, Factory, Truck, Store, UserCheck } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RoleBadge({ role, showIcon = true, size = "md" }: RoleBadgeProps) {
  const configs: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    ADMIN: {
      label: "Regulator / Admin",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-purple-600" />,
    },
    MANUFACTURER: {
      label: "Produsen Farmasi",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <Factory className="w-3.5 h-3.5 mr-1 text-blue-600" />,
    },
    DISTRIBUTOR: {
      label: "Distributor Resmi",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: <Truck className="w-3.5 h-3.5 mr-1 text-amber-600" />,
    },
    PHARMACY: {
      label: "Apotek Berlisensi",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: <Store className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    CONSUMER: {
      label: "Publik / Konsumen",
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />,
    },
  };

  const config = configs[role] || configs.CONSUMER;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs font-semibold px-2.5 py-1",
    lg: "text-sm font-semibold px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
