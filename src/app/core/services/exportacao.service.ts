import { Injectable } from '@angular/core';
import { Tarefa } from '../../models/tarefa.model';
import { StatusTarefaLabel } from '../../models/status-tarefa.enum';
import { CategoriaTarefaLabel } from '../../models/categoria-tarefa.enum';

@Injectable({ providedIn: 'root' })
export class ExportacaoService {

  private linhas(dados: Tarefa[]) {
    return dados.map(t => ({
      ID: t.id,
      Título: t.titulo,
      Descrição: t.descricao,
      Status: StatusTarefaLabel[t.status] ?? t.status,
      Categoria: CategoriaTarefaLabel[t.categoria] ?? t.categoria,
      Prioridade: t.prioridade,
      Vencimento: t.dataVencimento,
      'Criado por': t.criadoPor,
      Destinado: t.destinado ?? '',
    }));
  }

  exportarCsv(dados: Tarefa[], nome = 'tarefas'): void {
    const linhas = this.linhas(dados);
    const cab = Object.keys(linhas[0] ?? {});
    const csv = [cab.join(';'), ...linhas.map(l => Object.values(l).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    this.download(blob, `${nome}.csv`);
  }

  async exportarExcel(dados: Tarefa[], nome = 'tarefas'): Promise<void> {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(this.linhas(dados));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
    XLSX.writeFile(wb, `${nome}.xlsx`);
  }

  async exportarPdf(dados: Tarefa[], nome = 'tarefas'): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const linhas = this.linhas(dados);
    const cab = Object.keys(linhas[0] ?? {});
    autoTable(doc, { head: [cab], body: linhas.map(l => Object.values(l).map(String)), styles: { fontSize: 8 } });
    doc.save(`${nome}.pdf`);
  }

  private download(blob: Blob, nome: string): void {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: nome });
    a.click();
    URL.revokeObjectURL(url);
  }
}