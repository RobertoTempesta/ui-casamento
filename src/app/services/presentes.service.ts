import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
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

/** Lista inicial de presentes (migração) — com descrição e valor sugerido. */
interface PresenteInicial {
  nome: string;
  descricao?: string;
  valor?: number;
}

const PRESENTES_INICIAIS: PresenteInicial[] = [
  { nome: 'Forno Elétrico', descricao: 'Forno elétrico de embutir ou de mesa, ideal para assar e gratinar.', valor: 450 },
  { nome: 'Cooktop por indução', descricao: 'Cooktop 4 bocas por indução, vitrocerâmico.', valor: 899 },
  { nome: 'Jogo de panela por indução Brinox ceramic Vanilla', descricao: 'Jogo de panelas antiaderentes compatível com indução, linha Ceramic Vanilla.', valor: 349 },
  { nome: 'Bebedouro', descricao: 'Bebedouro elétrico com aquecimento e resfriamento.', valor: 299 },
  { nome: 'Jogo de talheres', descricao: 'Jogo de talheres em inox (24 peças ou 44 peças).', valor: 189 },
  { nome: 'Jogo de facas', descricao: 'Jogo de facas de cozinha em aço inox com suporte.', valor: 149 },
  { nome: 'Jogo de copos', descricao: 'Jogo de copos (água, suco e requeijão) em vidro ou cristal.', valor: 129 },
  { nome: 'Jogo de potes de vidro', descricao: 'Conjunto de potes herméticos de vidro para armazenar alimentos.', valor: 119 },
  { nome: 'Aspirador de pó', descricao: 'Aspirador de pó vertical ou canister.', valor: 399 },
  { nome: 'Jogo de toalhas de banho', descricao: 'Conjunto de toalhas de banho e rosto (frio ou fricção).', valor: 179 },
  { nome: 'Banquetas de madeira', descricao: 'Par de banquetas altas ou baixas para balcão ou ilha.', valor: 449 },
  { nome: 'Ferro de passar', descricao: 'Ferro de passar roupa a vapor ou central de vapor.', valor: 199 },
  { nome: 'Tanquinho', descricao: 'Máquina de lavar roupas semiautomática (tanquinho).', valor: 549 },
  { nome: 'Panela de pressão', descricao: 'Panela de pressão em inox, 6 ou 8 litros.', valor: 169 },
  { nome: 'Batedeira', descricao: 'Batedeira planetária ou batedeira de mesa.', valor: 279 },
  { nome: 'Jogo de assadeiras', descricao: 'Conjunto de assadeiras e formas para forno (vidro ou antiaderente).', valor: 139 },
  { nome: 'Jogo de jantar', descricao: 'Jogo de jantar (pratos, tigelas e travessas) para 6 ou 12 pessoas.', valor: 399 },
  { nome: 'Jogo de pratos', descricao: 'Jogo de pratos rasos e fundos em porcelana ou cerâmica.', valor: 249 },
];

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

  /** Em produção sempre usa Firestore; em dev usa localStorage só se a flag estiver true. */
  private get useLocal(): boolean {
    if (environment.production) return false;
    return !!environment.useLocalStorageForPresentes;
  }

  getCollectionRef() {
    return this.useLocal ? null : collection(this.db, COLLECTION);
  }

  /**
   * Busca um presente pelo id no banco (Firestore ou localStorage).
   * Útil para conferir se ainda não foi reservado antes de abrir o modal.
   */
  async obterPorId(id: string): Promise<Presente | null> {
    if (this.useLocal) {
      const list = this.getListRaw();
      const item = list.find((p) => p.id === id);
      return item ? storedToPresente(item) : null;
    }
    const docRef = doc(this.db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToPresente(docSnap as QueryDocumentSnapshot<DocumentData>);
  }

  async listar(): Promise<Presente[]> {
    if (this.useLocal) {
      return Promise.resolve(this.listarLocal());
    }
    const snapshot = await getDocs(collection(this.db, COLLECTION));
    if (snapshot.empty) {
      await this.executarMigracaoInicialFirestore();
      const novoSnapshot = await getDocs(collection(this.db, COLLECTION));
      return novoSnapshot.docs
        .map(docToPresente)
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }
    return snapshot.docs
      .map(docToPresente)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  /** Insere os presentes iniciais no Firestore (executado uma vez quando a coleção está vazia). */
  private async executarMigracaoInicialFirestore(): Promise<void> {
    const col = collection(this.db, COLLECTION);
    for (const p of PRESENTES_INICIAIS) {
      const data: Record<string, unknown> = { nome: p.nome, reservado: false };
      if (p.descricao) data['descricao'] = p.descricao;
      if (p.valor != null) data['valor'] = p.valor;
      await addDoc(col, data);
    }
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
    let list = this.getListRaw();
    if (list.length === 0) {
      this.executarMigracaoInicial();
      list = this.getListRaw();
    }
    return list
      .map(storedToPresente)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  /** Preenche a lista com os presentes iniciais (executado uma vez quando a lista está vazia). */
  private executarMigracaoInicial(): void {
    const list: PresenteStored[] = PRESENTES_INICIAIS.map((p, index) => ({
      id: `migracao-${Date.now()}-${index}`,
      nome: p.nome,
      descricao: p.descricao,
      valor: p.valor,
      reservado: false,
    }));
    this.salvarLocal(list);
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
