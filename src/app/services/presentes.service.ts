import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../core/firebase.config';
import { environment } from '../../environments/environment';
import { Presente, PresenteCreate } from '../models/presente.model';

const COLLECTION = 'presentes';
const STORAGE_KEY = 'ui-casamento-presentes';

/** Item como salvo no localStorage (reservadoEm em ms). */
interface PresenteStored {
  id: string;
  nome: string;
  descricao?: string;
  valor?: number;
  url?: string;
  reservado: boolean;
  reservadoPor?: string;
  reservadoEm?: number;
}

function storedToPresente(s: PresenteStored): Presente {
  return {
    id: s.id,
    nome: s.nome,
    descricao: s.descricao,
    valor: s.valor,
    url: s.url,
    reservado: s.reservado,
    reservadoPor: s.reservadoPor,
    reservadoEm: undefined,
  };
}

function docToPresente(docSnap: QueryDocumentSnapshot<DocumentData>): Presente {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    nome: data['nome'] ?? '',
    descricao: data['descricao'],
    valor: data['valor'],
    url: data['url'],
    reservado: data['reservado'] ?? false,
    reservadoPor: data['reservadoPor'],
    reservadoEm: data['reservadoEm'],
  };
}

@Injectable({ providedIn: 'root' })
export class PresentesService {
  private get db() {
    return getFirestoreInstance();
  }

  private get useLocal(): boolean {
    return !!environment.useLocalStorageForPresentes;
  }

  getCollectionRef() {
    return this.useLocal ? null : collection(this.db, COLLECTION);
  }

  async listar(): Promise<Presente[]> {
    if (this.useLocal) {
      return Promise.resolve(this.listarLocal());
    }
    const snapshot = await getDocs(collection(this.db, COLLECTION));
    return snapshot.docs
      .map(docToPresente)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  private getListRaw(): PresenteStored[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private listarLocal(): Presente[] {
    return this.getListRaw()
      .map(storedToPresente)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  private salvarLocal(list: PresenteStored[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async cadastrar(presente: PresenteCreate): Promise<string> {
    if (this.useLocal) {
      return Promise.resolve(this.cadastrarLocal(presente));
    }
    const data: Record<string, unknown> = {
      nome: presente.nome,
      reservado: false,
    };
    if (presente.descricao !== undefined && presente.descricao !== '') {
      data['descricao'] = presente.descricao;
    }
    if (presente.valor !== undefined && presente.valor !== null && !Number.isNaN(presente.valor)) {
      data['valor'] = presente.valor;
    }
    if (presente.url !== undefined && presente.url !== '') {
      data['url'] = presente.url;
    }
    const docRef = await addDoc(collection(this.db, COLLECTION), data);
    return docRef.id;
  }

  private cadastrarLocal(presente: PresenteCreate): string {
    const list = this.getListRaw();
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    list.push({
      id,
      nome: presente.nome,
      descricao: presente.descricao,
      valor: presente.valor,
      url: presente.url,
      reservado: false,
    });
    this.salvarLocal(list);
    return id;
  }

  async reservar(id: string, nomePessoa: string): Promise<void> {
    if (this.useLocal) {
      this.reservarLocal(id, nomePessoa);
      return Promise.resolve();
    }
    const docRef = doc(this.db, COLLECTION, id);
    await runTransaction(this.db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) {
        throw new Error('Presente não encontrado');
      }
      const data = docSnap.data();
      if (data['reservado']) {
        throw new Error('Este presente já foi reservado por outra pessoa');
      }
      transaction.update(docRef, {
        reservado: true,
        reservadoPor: nomePessoa,
        reservadoEm: Timestamp.now(),
      });
    });
  }

  private reservarLocal(id: string, nomePessoa: string): void {
    const list = this.getListRaw();
    const item = list.find((p) => p.id === id);
    if (!item) throw new Error('Presente não encontrado');
    if (item.reservado) throw new Error('Este presente já foi reservado por outra pessoa');
    item.reservado = true;
    item.reservadoPor = nomePessoa;
    item.reservadoEm = Date.now();
    this.salvarLocal(list);
  }

  async cancelarReserva(id: string): Promise<void> {
    if (this.useLocal) {
      this.cancelarReservaLocal(id);
      return Promise.resolve();
    }
    const docRef = doc(this.db, COLLECTION, id);
    await updateDoc(docRef, {
      reservado: false,
      reservadoPor: null,
      reservadoEm: null,
    });
  }

  private cancelarReservaLocal(id: string): void {
    const list = this.getListRaw();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.reservado = false;
      item.reservadoPor = undefined;
      item.reservadoEm = undefined;
      this.salvarLocal(list);
    }
  }

  async excluir(id: string): Promise<void> {
    if (this.useLocal) {
      this.excluirLocal(id);
      return Promise.resolve();
    }
    await deleteDoc(doc(this.db, COLLECTION, id));
  }

  private excluirLocal(id: string): void {
    const list = this.getListRaw();
    const filtered = list.filter((p) => p.id !== id);
    this.salvarLocal(filtered);
  }
}
