import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";

type ManageableClass = { class_id: string; class_name: string };
type PromotableStudent = {
  student_id: string;
  student_name: string;
  active: boolean;
};
type AllClass = { id: string; name: string };

type RecentPromotion = {
  id: string;
  student_ids: string[];
  source_class_name: string;
  target_class_name: string;
  deactivated: boolean;
  undone: boolean;
  created_at: string;
  student_count: number;
};

type PromotionState = {
  manageableClasses: ManageableClass[];
  allClasses: AllClass[];
  students: PromotableStudent[];
  loadingClasses: boolean;
  loadingStudents: boolean;
  fetchManageableClasses: () => Promise<void>;
  fetchAllClasses: () => Promise<void>;
  fetchStudents: (classId: string) => Promise<void>;
  recentPromotions: RecentPromotion[];
  fetchRecentPromotions: () => Promise<void>;
  undoPromotion: (promotionId: string) => Promise<void>;
  promoteStudents: (
    studentIds: string[],
    targetClassId: string,
    deactivate: boolean,
  ) => Promise<void>;
};

export const usePromotionStore = create<PromotionState>((set, get) => ({
  manageableClasses: [],
  allClasses: [],
  students: [],
  recentPromotions: [],
  loadingClasses: false,
  loadingStudents: false,

  fetchManageableClasses: async () => {
    set({ loadingClasses: true });
    try {
      const { data, error } = await supabase.rpc("my_manageable_classes");
      if (error) throw error;
      set({ manageableClasses: (data as ManageableClass[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loadingClasses: false });
    }
  },

  fetchAllClasses: async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .order("name");
      if (error) throw error;
      set({ allClasses: (data as AllClass[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    }
  },

  fetchStudents: async (classId: string) => {
    set({ loadingStudents: true, students: [] });
    try {
      const { data, error } = await supabase.rpc(
        "class_students_for_promotion",
        {
          p_class_id: classId,
        },
      );
      if (error) throw error;
      set({ students: (data as PromotableStudent[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loadingStudents: false });
    }
  },
  fetchRecentPromotions: async () => {
    try {
      const { data, error } = await supabase.rpc("my_recent_promotions", {
        p_limit: 10,
      });
      if (error) throw error;
      set({ recentPromotions: (data as RecentPromotion[]) ?? [] });
    } catch (err: any) {
      console.log(err);
    }
  },

  undoPromotion: async (promotionId: string) => {
    const { error } = await supabase.rpc("undo_promotion", {
      p_promotion_id: promotionId,
    });
    if (error) throw error;
    await get().fetchRecentPromotions();
  },

  promoteStudents: async (studentIds, targetClassId, deactivate) => {
    const { error } = await supabase.rpc("promote_students", {
      p_student_ids: studentIds,
      p_target_class_id: targetClassId,
      p_deactivate: deactivate,
    });
    if (error) throw error;
  },
}));
