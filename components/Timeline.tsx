"use client";

import React from "react";
import { CheckpointData, SupplyChainStage } from "@/frontend-exports/blockchain/types";
import { Factory, Truck, Store, CheckCircle2, MapPin, Calendar, FileText, User, ExternalLink } from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

interface TimelineProps {
  checkpoints: CheckpointData[];
  currentStage?: SupplyChainStage;
}

function getActorRoleLabel(role: string) {
  switch (role) {
    case "MANUFACTURER":
      return "Produsen";
    case "DISTRIBUTOR":
      return "Distributor";
    case "PHARMACY":
      return "Apotek";
    case "ADMIN":
      return "Regulator";
    case "CONSUMER":
      return "Konsumen";
    default:
      return role;
  }
}

export default function Timeline({ checkpoints, currentStage }: TimelineProps) {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="bg-surface-50 border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500">
        <p className="text-xs sm:text-sm">Belum ada riwayat titik pemeriksaan untuk batch ini.</p>
      </div>
    );
  }

  const getStageIcon = (stage: SupplyChainStage) => {
    switch (stage) {
      case SupplyChainStage.Manufactured:
        return <Factory className="w-4 h-4 text-teal-600" />;
      case SupplyChainStage.Distributed:
        return <Truck className="w-4 h-4 text-cyan-600" />;
      case SupplyChainStage.AtPharmacy:
        return <Store className="w-4 h-4 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
    }
  };

  const getStageColor = (stage: SupplyChainStage) => {
    switch (stage) {
      case SupplyChainStage.Manufactured:
        return {
          badge: "bg-teal-50 text-teal-800 border-teal-200",
          node: "bg-teal-600 ring-teal-100",
        };
      case SupplyChainStage.Distributed:
        return {
          badge: "bg-cyan-50 text-cyan-800 border-cyan-200",
          node: "bg-cyan-500 ring-cyan-100",
        };
      case SupplyChainStage.AtPharmacy:
        return {
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          node: "bg-emerald-600 ring-emerald-100",
        };
      default:
        return {
          badge: "bg-slate-50 text-slate-700 border-slate-200",
          node: "bg-slate-600 ring-slate-100",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-px before:bg-[#cbd8d2]">
        {checkpoints.map((cp, idx) => {
          const colors = getStageColor(cp.stage);

          return (
            <div key={`${cp.stage}-${idx}`} className="relative mb-6 last:mb-0">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ${colors.node} shadow-sm`}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>

              {/* Card Container */}
              <div className="border-b border-slate-200 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-surface-50 border border-slate-200/80 rounded-xl">
                      {getStageIcon(cp.stage)}
                    </span>
                    <div>
                      <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${colors.badge}`}>
                        Titik pemeriksaan #{idx + 1}: {cp.stageLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cp.timestampFormatted}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 text-xs">
                  {/* Location */}
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-400">Lokasi / Fasilitas</div>
                      <div className="font-bold text-navy-900 mt-0.5">{cp.location || "-"}</div>
                    </div>
                  </div>

                  {/* Actor */}
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <User className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-400">
                        Dicatat oleh ({getActorRoleLabel(cp.actorRole)})
                      </div>
                      <div className="font-bold text-navy-900 mt-0.5">
                        {cp.actorName ? `${cp.actorName} ` : ""}
                        <a
                          href={getExplorerAddressUrl(cp.actor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-teal-700 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold"
                          title={cp.actor}
                        >
                          <span>({cp.actor.substring(0, 6)}...{cp.actor.substring(cp.actor.length - 4)})</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {cp.notes && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-700 bg-surface-50/80 p-3 rounded-xl border border-slate-200/60">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-500">Catatan mutu: </span>
                      <span className="font-medium text-slate-800">{cp.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
