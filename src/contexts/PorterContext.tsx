import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PorterStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface PorterContextType {
  porterStatus: PorterStatus;
  isPorter: boolean;
  registerAsPorter: () => void;
  approvePorter: (userId: string) => void;
  rejectPorter: (userId: string, reason: string) => void;
}

const PorterContext = createContext<PorterContextType | undefined>(undefined);

export function PorterProvider({ children }: { children: ReactNode }) {
  const [porterStatus, setPorterStatus] = useState<PorterStatus>(() => {
    const saved = localStorage.getItem('porterStatus');
    return (saved as PorterStatus) || 'none';
  });

  useEffect(() => {
    localStorage.setItem('porterStatus', porterStatus);
  }, [porterStatus]);

  const isPorter = porterStatus === 'approved';

  const registerAsPorter = () => {
    setPorterStatus('pending');
  };

  const approvePorter = (userId: string) => {
    if (userId === 'current-user') {
      setPorterStatus('approved');
    }
  };

  const rejectPorter = (userId: string, reason: string) => {
    if (userId === 'current-user') {
      setPorterStatus('rejected');
    }
  };

  return (
    <PorterContext.Provider value={{ 
      porterStatus, 
      isPorter, 
      registerAsPorter,
      approvePorter,
      rejectPorter
    }}>
      {children}
    </PorterContext.Provider>
  );
}

export function usePorter() {
  const context = useContext(PorterContext);
  if (context === undefined) {
    throw new Error('usePorter must be used within a PorterProvider');
  }
  return context;
}
