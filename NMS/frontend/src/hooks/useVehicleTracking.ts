import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { socket } from '../lib/socket';
import { Vehicle } from '../types/api';

export interface LiveVehicle {
  vehicleId: string;
  imei: string;
  registration: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  ignition: boolean;
  timestamp: string;
  dbStatus: 'READY' | 'BUSY' | 'MAINTENANCE';
  isActive: boolean;
}

export type VehicleTrackingStatus = 'moving' | 'stopped' | 'busy' | 'maintenance' | 'offline';

export function getVehicleTrackingStatus(v: LiveVehicle): VehicleTrackingStatus {
  if (v.dbStatus === 'MAINTENANCE') return 'maintenance';
  if (v.dbStatus === 'BUSY') return 'busy';
  if (!v.isActive || !v.ignition) return 'offline';
  if (v.speed > 2) return 'moving';
  return 'stopped';
}

export function useVehicleTracking() {
  const [livePositions, setLivePositions] = useState<Map<string, LiveVehicle>>(new Map());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const { data: vehicles } = useQuery({
    queryKey: ['admin', 'vehicles', 'tracking'],
    queryFn: async () => {
      const res = await api.get('/admin/vehicles');
      return (res.data.data ?? res.data) as Vehicle[];
    },
    staleTime: 30_000,
    // Fallback: re-fetch DB positions every 35s in case the socket is down.
    // The socket is the primary path; this keeps the map alive on reconnect.
    refetchInterval: 35_000,
  });

  // Sync from DB — runs on mount and every 35s (fallback when socket is down).
  // Socket updates take priority: we only overwrite a position if the DB timestamp
  // is newer than what we already have.
  useEffect(() => {
    if (!vehicles) return;
    setLivePositions(prev => {
      const next = new Map(prev);
      for (const v of vehicles) {
        if (!v.lastLat || !v.lastLng) continue;
        const existing = next.get(v.id);
        const dbTs = new Date(v.lastLocationAt ?? 0).getTime();
        const existingTs = existing ? new Date(existing.timestamp).getTime() : 0;
        if (!existing || dbTs > existingTs) {
          next.set(v.id, {
            vehicleId: v.id,
            imei: v.imei,
            registration: v.registrationNumber,
            lat: v.lastLat,
            lng: v.lastLng,
            speed: existing?.speed ?? 0,
            heading: existing?.heading ?? 0,
            ignition: existing?.ignition ?? false,
            timestamp: v.lastLocationAt ?? new Date().toISOString(),
            dbStatus: (v.status as LiveVehicle['dbStatus']) ?? 'READY',
            isActive: v.isActive,
          });
        }
      }
      return next;
    });
    if (vehicles.some(v => v.lastLat)) {
      setLastUpdatedAt(prev => prev ?? new Date());
    }
  }, [vehicles]);

  // Real-time updates pushed from backend every 30s via Uffizio poll
  useEffect(() => {
    function onFleetPos(updates: LiveVehicle[]) {
      setLivePositions(prev => {
        const next = new Map(prev);
        for (const u of updates) {
          const existing = next.get(u.vehicleId);
          next.set(u.vehicleId, {
            vehicleId: u.vehicleId,
            imei: u.imei ?? existing?.imei ?? '',
            registration: u.registration ?? existing?.registration ?? '',
            lat: u.lat,
            lng: u.lng,
            speed: u.speed ?? 0,
            heading: u.heading ?? 0,
            ignition: u.ignition ?? false,
            timestamp: u.timestamp ?? new Date().toISOString(),
            dbStatus: u.dbStatus ?? existing?.dbStatus ?? 'READY',
            isActive: u.isActive ?? existing?.isActive ?? true,
          });
        }
        return next;
      });
      setLastUpdatedAt(new Date());
    }

    // Immediate vehicle status update when a task is dispatched or completed —
    // don't wait for the next 60s Uffizio poll to reflect BUSY/READY.
    function onTaskAssigned(task: { vehicleId: string }) {
      setLivePositions(prev => {
        const next = new Map(prev);
        for (const [key, v] of next) {
          if (v.vehicleId === task.vehicleId) {
            next.set(key, { ...v, dbStatus: 'BUSY' });
          }
        }
        return next;
      });
    }

    function onTaskUpdated(task: { vehicleId: string; status: string }) {
      if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
        setLivePositions(prev => {
          const next = new Map(prev);
          for (const [key, v] of next) {
            if (v.vehicleId === task.vehicleId) {
              next.set(key, { ...v, dbStatus: 'READY' });
            }
          }
          return next;
        });
      }
    }

    socket.on('fleet:pos', onFleetPos);
    socket.on('task:assigned', onTaskAssigned);
    socket.on('task:updated', onTaskUpdated);
    return () => {
      socket.off('fleet:pos', onFleetPos);
      socket.off('task:assigned', onTaskAssigned);
      socket.off('task:updated', onTaskUpdated);
    };
  }, []);

  return {
    vehicles: Array.from(livePositions.values()),
    lastUpdatedAt,
  };
}
