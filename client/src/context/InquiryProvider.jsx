import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ProjectInquiryModal } from '@/components/project-inquiry/ProjectInquiryModal';

const InquiryContext = createContext(null);

export function InquiryProvider({ children }) {
  const [isOpen, setOpen] = useState(false);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <ProjectInquiryModal isOpen={isOpen} onClose={close} />
    </InquiryContext.Provider>
  );
}

/** @returns {{ isOpen: boolean; open: () => void; close: () => void }} */
export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error('useInquiry must be used within InquiryProvider');
  return ctx;
}
