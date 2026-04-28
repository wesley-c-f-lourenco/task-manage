import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarefa, CriarTarefaDto, AtualizarTarefaDto } from '../../models/tarefa.model';

const URL_BASE = 'http://localhost:3000';

export interface FiltrosTarefa {
  status?: string;
  categoria?: string;
  busca?: string;
}

@Injectable({ providedIn: 'root' })
export class TarefaApiService {
  private http = inject(HttpClient);

  buscarTodas(filtros?: FiltrosTarefa): Observable<Tarefa[]> {
    let params = new HttpParams();
    if (filtros?.status) params = params.set('status', filtros.status);
    if (filtros?.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros?.busca) params = params.set('titulo_like', filtros.busca);
    return this.http.get<Tarefa[]>(`${URL_BASE}/tarefas`, { params });
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${URL_BASE}/tarefas/${id}`);
  }

  criar(dto: CriarTarefaDto): Observable<Tarefa> {
    return this.http.post<Tarefa>(`${URL_BASE}/tarefas`, dto);
  }

  atualizar(id: number, dto: AtualizarTarefaDto): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${URL_BASE}/tarefas/${id}`, dto);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${URL_BASE}/tarefas/${id}`);
  }
}