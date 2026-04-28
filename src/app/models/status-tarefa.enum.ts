export enum StatusTarefa {
  AFazer = 'a-fazer',
  EmAndamento = 'em-andamento',
  Concluido = 'concluido',
  Cancelado = 'cancelado',
}

export const StatusTarefaLabel: Record<StatusTarefa, string> = {
  [StatusTarefa.AFazer]: 'A Fazer',
  [StatusTarefa.EmAndamento]: 'Em Andamento',
  [StatusTarefa.Concluido]: 'Feito',
  [StatusTarefa.Cancelado]: 'Cancelado',
};