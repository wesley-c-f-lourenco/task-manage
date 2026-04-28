export enum CategoriaTarefa {
  Administrativo = 'administrativo',
  Juridico = 'juridico',
  Financeiro = 'financeiro',
  TI = 'ti',
  RH = 'rh',
  Comercial = 'comercial',
  Operacional = 'operacional',
  Outros = 'outros',
}

export const CategoriaTarefaLabel: Record<CategoriaTarefa, string> = {
  [CategoriaTarefa.Administrativo]: 'Administrativo',
  [CategoriaTarefa.Juridico]: 'Jurídico',
  [CategoriaTarefa.Financeiro]: 'Financeiro',
  [CategoriaTarefa.TI]: 'TI',
  [CategoriaTarefa.RH]: 'RH',
  [CategoriaTarefa.Comercial]: 'Comercial',
  [CategoriaTarefa.Operacional]: 'Operacional',
  [CategoriaTarefa.Outros]: 'Outros',
};