import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Company } from '@/src/core/domain/entities/Company';

interface CompanyState {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
    }),
    {
      name: 'remisiones-selected-company',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
