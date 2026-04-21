import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Languages, Globe } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Badge } from "../components/Badge";
import { specialtyApi } from "../services/specialtyApi";
import { Specialty } from "../types";
import { toast, Toaster } from "sonner";

const Specialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null,
  );

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setIsLoading(true);
    try {
      const res = await specialtyApi.getSpecialties();
      // تأكد من هيكلية البيانات القادمة من السيرفر
      const data = res.data || res;
      setSpecialties(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch specialties");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this specialty?")) {
      try {
        await specialtyApi.deleteSpecialty(id);
        setSpecialties(specialties.filter((s) => s.id !== id));
        toast.success("Specialty deleted successfully");
      } catch (error) {
        toast.error("Failed to delete specialty");
      }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      name_ar: formData.get("name_ar") as string,
    };

    try {
      if (editingSpecialty) {
        const res = await specialtyApi.updateSpecialty(
          editingSpecialty.id,
          data,
        );
        const updatedData = res.data || res;
        setSpecialties(
          specialties.map((s) =>
            s.id === editingSpecialty.id ? updatedData : s,
          ),
        );
        toast.success("Specialty updated successfully");
      } else {
        const res = await specialtyApi.createSpecialty(data);
        const newData = res.data || res;
        setSpecialties([newData, ...specialties]);
        toast.success("Specialty created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save specialty");
    }
  };

  const columns = [
    {
      header: "Specialty Details",
      accessor: (s: Specialty) => (
        <div className="flex flex-col gap-2 py-2">
          {/* عرض الاسم الإنجليزي */}
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-8 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500">
              EN
            </span>
            <span className="font-semibold text-carbon-black">{s.name}</span>
          </div>

          {/* عرض الاسم العربي */}
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-8 items-center justify-center rounded bg-emerald-50 text-[10px] font-bold text-emerald-600">
              AR
            </span>
            <span className="font-medium text-slate-600 font-arabic" dir="rtl">
              {s.name_ar || "---"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (s: Specialty) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingSpecialty(s);
              setIsModalOpen(true);
            }}
            className="hover:bg-slate-100"
          >
            <Edit2 className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(s.id)}
            className="text-rose-500 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <Toaster position="top-right" richColors />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-carbon-black flex items-center gap-3">
            Specialties
            <span className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
            <span
              className="text-slate-400 text-lg font-normal font-arabic"
              dir="rtl"
            ></span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hospital specialties in both languages.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingSpecialty(null);
            setIsModalOpen(true);
          }}
          className="btn-emerald shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Specialty
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
        <DataTable columns={columns} data={specialties} isLoading={isLoading} />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpecialty ? "Edit Specialty" : "Add New Specialty"}
      >
        <form className="p-6 space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-6">
            {/* English Input */}
            <div className="space-y-2">
              <Input
                label="Specialty Name (English)"
                name="name"
                defaultValue={editingSpecialty?.name}
                required
                placeholder="e.g. Dental Surgery"
                icon={<Globe className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Arabic Input */}
            <div className="space-y-2">
              <Input
                label="اسم التخصص (عربي)"
                name="name_ar"
                defaultValue={editingSpecialty?.name_ar}
                required
                dir="rtl"
                placeholder="مثال: جراحة الأسنان"
                icon={<Languages className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-emerald px-10">
              {editingSpecialty ? "Update Changes" : "Save Specialty"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Specialties;
