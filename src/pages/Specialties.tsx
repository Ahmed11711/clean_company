import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
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
      setSpecialties(res.data || []);
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
      // تم التغيير هنا من title إلى name
      name: formData.get("name") as string,
    };

    try {
      if (editingSpecialty) {
        const res = await specialtyApi.updateSpecialty(
          editingSpecialty.id,
          data,
        );
        setSpecialties(
          specialties.map((s) => (s.id === editingSpecialty.id ? res.data : s)),
        );
        toast.success("Specialty updated successfully");
      } else {
        const res = await specialtyApi.createSpecialty(data);
        setSpecialties([res.data, ...specialties]);
        toast.success("Specialty created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save specialty");
    }
  };

  const columns = [
    {
      header: "Specialty Name", // تم تحديث العنوان
      accessor: (s: Specialty) => (
        <div className="font-semibold text-carbon-black">{s.name}</div>
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
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(s.id)}
            className="text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-carbon-black">
          Specialties
        </h1>
        <Button
          onClick={() => {
            setEditingSpecialty(null);
            setIsModalOpen(true);
          }}
          className="btn-emerald"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Specialty
        </Button>
      </div>

      <DataTable columns={columns} data={specialties} isLoading={isLoading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpecialty ? "Edit Specialty" : "Add New Specialty"}
      >
        <form className="p-6 space-y-6" onSubmit={handleSave}>
          <div className="space-y-5">
            <Input
              label="Specialty Name"
              name="name" // تم التغيير هنا
              defaultValue={editingSpecialty?.name} // تم التغيير هنا
              required
              placeholder="e.g. Cardiology"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-emerald px-8">
              Save Specialty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Specialties;
