import { create } from "zustand";

interface InboxItemDto {
  approvalRequestId: number;
  requestId: string;
  title: string;
  requestedById: string;
  status: string;
  createdAt: string;
  currentStep: number;
  totalSteps: number;
  flowId: number;
}

interface ApprovalInboxState {
  items: InboxItemDto[];
  loading: boolean;
  setItems: (items: InboxItemDto[]) => void;
  setLoading: (val: boolean) => void;
  removeItemById: (id: number) => void;
  globalActionLoading: boolean;
  setGlobalActionLoading: (val: boolean) => void;
}

export const useApprovalInboxStore = create<ApprovalInboxState>((set) => ({
  items: [],
  loading: true,
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  removeItemById: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.approvalRequestId !== id),
    })),
  globalActionLoading: false,
  setGlobalActionLoading: (val) => set({ globalActionLoading: val }),

}));
