
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook unificado: usa únicamente el AuthContext definido en context/AuthContext.tsx
export const useAuth = () => useContext(AuthContext);