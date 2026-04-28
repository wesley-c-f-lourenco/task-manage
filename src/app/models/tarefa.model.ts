import { StatusTarefa } from './status-tarefa.enum';
import { CategoriaTarefa } from './categoria-tarefa.enum';

export type Prioridade = 'baixa' | 'media' | 'alta';

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusTarefa;
  categoria: CategoriaTarefa;
  prioridade: Prioridade;
  dataVencimento: string;
  anotacao?: string;
  horario?: string;
  destinado?: string;
  criadoPor: string;
  criadoEm: string;
}

export type CriarTarefaDto = Omit<Tarefa, 'id' | 'criadoEm'>;
export type AtualizarTarefaDto = Partial<CriarTarefaDto>;