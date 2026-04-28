import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { TarefaApiService } from './tarefa-api.service';
import { Tarefa, CriarTarefaDto, AtualizarTarefaDto } from '../../models/tarefa.model';
import { StatusTarefa } from '../../models/status-tarefa.enum';
import { CategoriaTarefa } from '../../models/categoria-tarefa.enum';

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private api = inject(TarefaApiService);

  tarefas = signal<Tarefa[]>([]);
  carregando = signal<boolean>(false);
  erro = signal<string | null>(null);
  termoBusca = signal<string>('');
  filtroStatus = signal<StatusTarefa | 'todos'>('todos');
  filtroCategoria = signal<CategoriaTarefa | 'todos'>('todos');

  filtradas = computed(() => {
    const termo = this.termoBusca().toLowerCase();
    const status = this.filtroStatus();
    const categoria = this.filtroCategoria();
    return this.tarefas()
      .filter(t => status === 'todos' || t.status === status)
      .filter(t => categoria === 'todos' || t.categoria === categoria)
      .filter(t => !termo || t.titulo.toLowerCase().includes(termo));
  });

  contadores = computed(() => {
    const lista = this.tarefas();
    return {
      total: lista.length,
      aFazer: lista.filter(t => t.status === StatusTarefa.AFazer).length,
      emAndamento: lista.filter(t => t.status === StatusTarefa.EmAndamento).length,
      concluido: lista.filter(t => t.status === StatusTarefa.Concluido).length,
      cancelado: lista.filter(t => t.status === StatusTarefa.Cancelado).length,
    };
  });

  constructor() {
    effect(() => {
      const _ = this.filtroStatus();
      const __ = this.filtroCategoria();
    });
  }

  carregarTodas(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.api.buscarTodas().pipe(
      catchError(() => {
        this.erro.set('Erro ao carregar. Verifique se o json-server está rodando.');
        return of([]);
      }),
      finalize(() => this.carregando.set(false))
    ).subscribe(dados => this.tarefas.set(dados));
  }

  criar(dto: CriarTarefaDto): Promise<Tarefa | null> {
    return new Promise(resolve => {
      this.api.criar(dto).pipe(
        catchError(() => { resolve(null); return of(null); })
      ).subscribe(nova => {
        if (nova) { this.tarefas.update(l => [...l, nova]); resolve(nova); }
      });
    });
  }

  atualizar(id: number, dto: AtualizarTarefaDto): Promise<Tarefa | null> {
    return new Promise(resolve => {
      this.api.atualizar(id, dto).pipe(
        catchError(() => { resolve(null); return of(null); })
      ).subscribe(atualizada => {
        if (atualizada) {
          this.tarefas.update(l => l.map(t => t.id === id ? atualizada : t));
          resolve(atualizada);
        }
      });
    });
  }

  remover(id: number): Promise<boolean> {
    return new Promise(resolve => {
      this.api.remover(id).pipe(
        catchError(() => { resolve(false); return of(null); })
      ).subscribe(() => {
        this.tarefas.update(l => l.filter(t => t.id !== id));
        resolve(true);
      });
    });
  }
}