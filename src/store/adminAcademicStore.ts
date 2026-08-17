import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { AdminAcademicYear, AdminTerm } from "@/types/adminAcademic.types";

type AdminAcademicState = {
  academicYears: AdminAcademicYear[];
  terms: AdminTerm[];
  loading: boolean;

  fetchAll: () => Promise<void>;

  createAcademicYear: (name: string) => Promise<void>;
  setActiveAcademicYear: (id: string) => Promise<void>;
  toggleArchiveAcademicYear: (id: string, archived: boolean) => Promise<void>;

  createTerm: (name: string) => Promise<void>;
  setActiveTerm: (id: string) => Promise<void>;
  toggleTermOpen: (id: string, isOpen: boolean) => Promise<void>;
};

export const useAdminAcademicStore = create<AdminAcademicState>((set, get) => ({
  academicYears: [],
  terms: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [yearsRes, termsRes] = await Promise.all([
        supabase.from("academic_years").select("*").order("name", { ascending: false }),
        supabase.from("terms").select("*").order("name", { ascending: true }),
      ]);

      if (yearsRes.error) throw yearsRes.error;
      if (termsRes.error) throw termsRes.error;

      set({
        academicYears: (yearsRes.data as AdminAcademicYear[]) ?? [],
        terms: (termsRes.data as AdminTerm[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loading: false });
    }
  },

  createAcademicYear: async (name) => {
    try {
      const { error } = await supabase.from("academic_years").insert({ name, current: false });
      if (error) throw error;
      showToast.success("Academic year created");
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Create failed", err.message);
    }
  },

  setActiveAcademicYear: async (id) => {
    try {
      const { error } = await supabase.rpc("admin_set_active_academic_year", { p_id: id });
      if (error) throw error;
      showToast.success("Active academic year updated");
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Update failed", err.message);
    }
  },

  toggleArchiveAcademicYear: async (id, archived) => {
    try {
      const { error } = await supabase.rpc("admin_set_academic_year_archived", {
        p_id: id,
        p_archived: archived,
      });
      if (error) throw error;
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Update failed", err.message);
    }
  },

  createTerm: async (name) => {
    try {
      const { error } = await supabase.from("terms").insert({ name, is_current: false, is_open: true });
      if (error) throw error;
      showToast.success("Term created");
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Create failed", err.message);
    }
  },

  setActiveTerm: async (id) => {
    try {
      const { error } = await supabase.rpc("admin_set_active_term", { p_id: id });
      if (error) throw error;
      showToast.success("Active term updated");
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Update failed", err.message);
    }
  },

  toggleTermOpen: async (id, isOpen) => {
    try {
      const { error } = await supabase.rpc("admin_set_term_open", { p_id: id, p_open: isOpen });
      if (error) throw error;
      await get().fetchAll();
    } catch (err: any) {
      console.log(err);
      showToast.error("Update failed", err.message);
    }
  },
}));