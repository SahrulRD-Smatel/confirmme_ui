import { create } from 'zustand';

interface PdfStore {
  pdfUrl: string | null;
  setPdfUrl: (url: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const usePdfStore = create<PdfStore>((set) => ({
  pdfUrl: null,
  setPdfUrl: (url: string) => set({ pdfUrl: url }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
}));
