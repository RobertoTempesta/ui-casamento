import { Timestamp } from 'firebase/firestore';

export interface Presente {
  id: string;
  nome: string;
  descricao?: string;
  valor?: number;
  url?: string;
  reservado: boolean;
  reservadoPor?: string;
  reservadoEm?: Timestamp;
}

export interface PresenteCreate {
  nome: string;
  descricao?: string;
  valor?: number;
  url?: string;
}
