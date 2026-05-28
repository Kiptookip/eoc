import { useEffect, useState } from "react";
import { Building2, MoreVertical, Plus } from "lucide-react";
import api from "../../api/client";

type Facility = {
  id: string;
  name: string;
  type?: string;
  kephLevel: number;
  subCounty?: string;
  address?: string;
  emergencyContact?: string;
  casualtyContact?: string;
  isActive: boolean;
};

export default function FacilityManagementPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadFacilities() {
    try {
      setLoading(true);

      const response = await api.get("/admin/facilities");

      setFacilities(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacilities();
  }, []);

  async function deactivateFacility(id: string) {
    try {
      await api.patch(`/admin/facilities/${id}`, {
        isActive: false,
      });

      loadFacilities();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-surface-border rounded-2xl p-8 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[0.3em] font-bold text-slate-400 uppercase">
            Health Infrastructure Registry
          </div>

          <h1 className="text-5xl font-black mt-3 text-black">
            FACILITY ONBOARDING
          </h1>
        </div>

        <button className="bg-brand-green hover:brightness-95 text-black font-bold px-6 py-4 rounded-2xl flex items-center gap-2">
          <Plus size={18} />
          ADD FACILITY
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-surface-border rounded-2xl p-6">
          <div className="text-xs tracking-[0.2em] uppercase text-slate-400 font-bold">
            Total Facilities
          </div>

          <div className="text-5xl font-black mt-3">
            {facilities.length}
          </div>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-6">
          <div className="text-xs tracking-[0.2em] uppercase text-slate-400 font-bold">
            Active Facilities
          </div>

          <div className="text-5xl font-black mt-3">
            {facilities.filter((f) => f.isActive).length}
          </div>
        </div>

        <div className="bg-black rounded-2xl p-6 text-white">
          <div className="text-xs tracking-[0.2em] uppercase text-lime-400 font-bold">
            Facility Coverage
          </div>

          <div className="text-5xl font-black mt-3">
            {facilities.length}
          </div>

          <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-full bg-lime-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-surface-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-surface-border bg-slate-50">
            <tr className="text-left text-xs tracking-[0.25em] uppercase text-slate-400">
              <th className="p-5">Facility</th>
              <th className="p-5">Level</th>
              <th className="p-5">Sub County</th>
              <th className="p-5">Emergency Contact</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-6" colSpan={6}>
                  Loading facilities...
                </td>
              </tr>
            ) : facilities.length === 0 ? (
              <tr>
                <td className="p-6" colSpan={6}>
                  No facilities found
                </td>
              </tr>
            ) : (
              facilities.map((facility) => (
                <tr
                  key={facility.id}
                  className="border-b border-surface-border"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-lime-100 flex items-center justify-center">
                        <Building2 className="text-lime-700" size={20} />
                      </div>

                      <div>
                        <div className="font-black text-sm">
                          {facility.name}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {facility.address || facility.type || "Hospital"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className="bg-lime-100 text-lime-700 text-xs font-black px-3 py-1 rounded-full">
                      LEVEL {facility.kephLevel}
                    </span>
                  </td>

                  <td className="p-5 font-semibold">
                    {facility.subCounty || "-"}
                  </td>

                  <td className="p-5 text-sm">
                    {facility.emergencyContact ||
                      facility.casualtyContact ||
                      "-"}
                  </td>

                  <td className="p-5">
                    {facility.isActive ? (
                      <span className="text-lime-600 font-bold text-sm">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-sm">
                        INACTIVE
                      </span>
                    )}
                  </td>

                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                      <button className="border px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50">
                        EDIT
                      </button>

                      <button
                        onClick={() => deactivateFacility(facility.id)}
                        className="border border-red-200 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50"
                      >
                        DEACTIVATE
                      </button>

                      <button className="border rounded-xl h-10 w-10 flex items-center justify-center">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}