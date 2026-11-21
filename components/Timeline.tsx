"use client";

import React from "react";
import { CheckpointData, SupplyChainStage } from "@/frontend-exports/blockchain/types";
import { Factory, Truck, Store, CheckCircle2, MapPin, Calendar, FileText, User } from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

interface TimelineProps {
  checkpoints: CheckpointData[];
  currentStage?: SupplyChainStage;
}

export default function Timeline({ checkpoints, currentStage }: TimelineProps) {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <p className="text-sm">Belum ada riwayat checkpoint yang dicatat untuk batch ini.</p>
      </div>
    );
  }

  const getStageIcon = (stage: SupplyChainStage) => {
    switch (stage) {
      case SupplyChainStage.Manufactured:
        return <Factory className="w-5 h-5 text-blue-600" />;
      case SupplyChainStage.Distributed:
        return <Truck className="w-5 h-5 text-amber-600" />;
      case SupplyChainStage.AtPharmacy:
        return <Store className="w-5 h-5 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-brand-600" />;
    }
  };

  const getStageColor = (stage: SupplyChainStage) => {
    switch (stage) {
      case SupplyChainStage.Manufactured:
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          node: "bg-blue-600 ring-blue-100",
        };
      case SupplyChainStage.Distributed:
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          node: "bg-amber-500 ring-amber-100",
        };
      case SupplyChainStage.AtPharmacy:
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {checkpoints.map((cp, idx) => {
          const colors = getStageColor(cp.stage);
          const isLast = idx === checkpoints.length - 1;

          return (
            <div key={`${cp.stage}-${idx}`} className="relative mb-8 last:mb-0">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ${colors.node}`}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>

              {/* Card Container */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-50 rounded-lg">{getStageIcon(cp.stage)}</span>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.badge}`}>
                        Checkpoint #{idx + 1}: {cp.stageLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cp.timestampFormatted}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  {/* Location */}
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-500">Lokasi / Fasilitas</div>
                      <div className="font-semibold text-slate-900">{cp.location || "-"}</div>
                    </div>
                  </div>

                  {/* Actor */}
                  <div className="flex items-start gap-2 text-slate-700">
                    <User className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-500">
                        Entitas Pencatat ({cp.actorRole})
                      </div>
                      <div className="font-semibold text-slate-900">
                        {cp.actorName ? `${cp.actorName} ` : ""}
                        <a
                          href={getExplorerAddressUrl(cp.actor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-brand-600 hover:underline inline-block text-[11px]"
                          title={cp.actor}
                        >
                          ({cp.actor.substring(0, 6)}...{cp.actor.substring(cp.actor.length - 4)})
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {cp.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-700">Catatan Mutu / Kondisi: </span>
                      {cp.notes}
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
