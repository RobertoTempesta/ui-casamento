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
import { Presente, PresenteCreate } from '../models/presente.model';

const COLLECTION = 'presentes';

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

  getCollectionRef() {
    return collection(this.db, COLLECTION);
  }

  async listar(): Promise<Presente[]> {
    const snapshot = await getDocs(collection(this.db, COLLECTION));
    return snapshot.docs
      .map(docToPresente)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async cadastrar(presente: PresenteCreate): Promise<string> {
    const docRef = await addDoc(collection(this.db, COLLECTION), {
      ...presente,
      reservado: false,
    });
    return docRef.id;
  }

  async reservar(id: string, nomePessoa: string): Promise<void> {
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

  async cancelarReserva(id: string): Promise<void> {
    const docRef = doc(this.db, COLLECTION, id);
    await updateDoc(docRef, {
      reservado: false,
      reservadoPor: null,
      reservadoEm: null,
    });
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(this.db, COLLECTION, id));
  }
}
