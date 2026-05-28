import { useEffect, useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import api from "../../api/client";

type Facility = {
  id: string;
  name: string;
  kephLevel: number;
  subCounty?: string;
  address?: string;
  emergencyContact?: string;
  casualtyContact?: string;
  isActive: boolean;
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFacilities() {
    setLoading(true);
    const res = await api.get("/facilities");
    setFacilities(res.data);
    setLoading(false);
  }

  useEffect(() => {
    loadFacilities();
  }, []);

  async function deactivateFacility(id: string) {
    await api.patch(`/facilities/${id}`, { isActive: false });
    loadFacilities();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-8 flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[0.35em] text-slate-500 font-bold">
            HEALTH FACILITY REGISTRY
          </div>
          <h1 className="text-4xl font-black mt-3">FACILITY ONBOARDING</h1>
        </div>

        <button className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-4 rounded-xl flex items-center gap-2">
          <Plus size={18} />
          ADD FACILITY
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs tracking-[0.25em]">
            <tr>
              <th className="text-left p-5">FACILITY</th>
              <th className="text-left p-5">LEVEL</th>
              <th className="text-left p-5">SUB COUNTY</th>
              <th className="text-left p-5">CONTACT</th>
              <th className="text-left p-5">STATUS</th>
              <th className="text-right p-5">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-5" colSpan={6}>Loading facilities...</td>
              </tr>
            ) : (
              facilities.map((facility) => (
                <tr key={facility.id} className="border-t">
                  <td className="p-5">
                    <div className="font-black">{facility.name}</div>
                    <div className="text-xs text-slate-500">{facility.address}</div>
                  </td>

                  <td className="p-5">
                    <span className="bg-lime-100 text-lime-700 px-3 py-1 rounded-full font-bold">
                      LEVEL {facility.kephLevel}
                    </span>
                  </td>

                  <td className="p-5 font-semibold">
                    {facility.subCounty || "-"}
                  </td>

                  <td className="p-5 text-slate-600">
                    {facility.emergencyContact || facility.casualtyContact || "-"}
                  </td>

                  <td className="p-5">
                    <span className={facility.isActive ? "text-lime-600 font-bold" : "text-red-500 font-bold"}>
                      {facility.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="p-5 text-right">
                    <button
                      onClick={() => deactivateFacility(facility.id)}
                      className="border rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-50"
                    >
                      DEACTIVATE
                    </button>
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