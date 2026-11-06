import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GenerationMode, GenerationStatus } from "../../shared/api/types";

export interface RecentTask {
  recordId: string;
  prompt: string;
  status: GenerationStatus;
  mode: GenerationMode;
  width: number;
  height: number;
  createdAt: string;
  styleName?: string;
  imageUrl?: string;
}

interface WorkspaceState {
  mode: GenerationMode;
  activeRecordId: string | null;
  recentTasks: RecentTask[];
  preferredSize: { width: number; height: number };
  isRecentDrawerOpen: boolean;
  setMode: (mode: GenerationMode) => void;
  setActiveRecordId: (recordId: string | null) => void;
  addRecentTask: (task: RecentTask) => void;
  updateRecentTask: (
    recordId: string,
    patch: Partial<Omit<RecentTask, "recordId">>,
  ) => void;
  removeRecentTask: (recordId: string) => void;
  setPreferredSize: (size: { width: number; height: number }) => void;
  setRecentDrawerOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      mode: "simple",
      activeRecordId: null,
      recentTasks: [],
      preferredSize: { width: 512, height: 512 },
      isRecentDrawerOpen: false,
      setMode: (mode) => set({ mode }),
      setActiveRecordId: (activeRecordId) => set({ activeRecordId }),
      addRecentTask: (task) =>
        set((state) => ({
          activeRecordId: task.recordId,
          recentTasks: [
            task,
            ...state.recentTasks.filter(
              (item) => item.recordId !== task.recordId,
            ),
          ].slice(0, 10),
        })),
      updateRecentTask: (recordId, patch) =>
        set((state) => ({
          recentTasks: state.recentTasks.map((task) =>
            task.recordId === recordId ? { ...task, ...patch } : task,
          ),
        })),
      removeRecentTask: (recordId) =>
        set((state) => ({
          activeRecordId:
            state.activeRecordId === recordId
              ? state.recentTasks.find((task) => task.recordId !== recordId)
                  ?.recordId || null
              : state.activeRecordId,
          recentTasks: state.recentTasks.filter(
            (task) => task.recordId !== recordId,
          ),
        })),
      setPreferredSize: (preferredSize) => set({ preferredSize }),
      setRecentDrawerOpen: (isRecentDrawerOpen) =>
        set({ isRecentDrawerOpen }),
    }),
    {
      name: "photo-web:workspace",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        mode: state.mode,
        activeRecordId: state.activeRecordId,
        recentTasks: state.recentTasks,
        preferredSize: state.preferredSize,
      }),
    },
  ),
);
