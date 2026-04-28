import { Injectable, signal } from '@angular/core';
import { Perfil } from '../../models/perfil.model';

const CHAVE = 'task_manager_perfil';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  perfil = signal<Perfil | null>(this.carregar());

  private carregar(): Perfil | null {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? JSON.parse(salvo) : null;
  }

  salvar(perfil: Perfil): void {
    localStorage.setItem(CHAVE, JSON.stringify(perfil));
    this.perfil.set(perfil);
  }

  limpar(): void {
    localStorage.removeItem(CHAVE);
    this.perfil.set(null);
  }

  temPerfil(): boolean {
    return this.perfil() !== null;
  }
}