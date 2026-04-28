import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TarefaService } from '../../core/services/tarefa.service';
import { PerfilService } from '../../core/services/perfil.service';
import { ExportacaoService } from '../../core/services/exportacao.service';
import { Tarefa, CriarTarefaDto } from '../../models/tarefa.model';
import { StatusTarefa, StatusTarefaLabel } from '../../models/status-tarefa.enum';
import { CategoriaTarefa, CategoriaTarefaLabel } from '../../models/categoria-tarefa.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tarefaService = inject(TarefaService);
  perfilService = inject(PerfilService);
  private exportService = inject(ExportacaoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  modoPerfil = signal<'meu' | 'equipe'>('meu');
  dialogAberto = signal(false);
  tarefaEditando = signal<Tarefa | null>(null);
  tarefaSelecionada = signal<Tarefa | null>(null);
  dataSelecionada = signal<string>('');
  toastMsg = signal<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  mesAtual = signal(new Date());
  temaEscuro = signal(false);

  diasDoMes = computed(() => {
    const d = this.mesAtual();
    const ano = d.getFullYear();
    const mes = d.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const dias: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(null);
    for (let i = 1; i <= totalDias; i++) dias.push(i);
    return dias;
  });

  tarefasFiltradas = computed(() => {
  const perfil = this.perfilService.perfil();
  const todas = this.tarefaService.filtradas();
  const hoje = new Date().toISOString().slice(0, 10);

  const visiveis = todas.filter(t => {
    const passada = t.dataVencimento < hoje;
    const concluida = t.status === StatusTarefa.Concluido;
    if (passada && concluida) return false;
    return true;
  });

  if (this.modoPerfil() === 'meu') {
    return visiveis.filter(t => t.criadoPor === perfil?.matricula || t.destinado === perfil?.matricula);
  }

  // equipe: tarefas sem destinado ou destinadas a outro
  return visiveis.filter(t => !t.destinado || t.destinado === '');
});

todasParaCalendario = computed(() => {
  const perfil = this.perfilService.perfil();
  const todas = this.tarefaService.filtradas();

  if (this.modoPerfil() === 'meu') {
    return todas.filter(t => t.criadoPor === perfil?.matricula || t.destinado === perfil?.matricula);
  }

  // equipe: tarefas sem destinado
  return todas.filter(t => !t.destinado || t.destinado === '');
});
  tarefasDoDia = computed(() => {
    const dia = this.dataSelecionada();
    if (!dia) return [];
    return this.tarefasFiltradas().filter(t => t.dataVencimento === dia);
  });
  diaSegundoPainel = signal<string>((() => {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return amanha.toISOString().slice(0, 10);
})());
  statusOpcoes = Object.values(StatusTarefa).map(v => ({ label: StatusTarefaLabel[v], value: v }));
  categoriaOpcoes = Object.values(CategoriaTarefa).map(v => ({ label: CategoriaTarefaLabel[v], value: v }));
  prioridadeOpcoes = [
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' },
  ];
  horariosOpcoes: string[] = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  form = this.fb.group({
    titulo:         ['', [Validators.required, Validators.minLength(3)]],
    descricao:      ['', [Validators.required]],
    status:         [StatusTarefa.AFazer, [Validators.required]],
    categoria:      [CategoriaTarefa.Administrativo, [Validators.required]],
    prioridade:     ['media', [Validators.required]],
    dataVencimento: ['', [Validators.required]],
    anotacao: [''],
    horario:  [''],
    destinado: [''],
  });

  ngOnInit() { this.tarefaService.carregarTodas(); }

  async salvarTarefa() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const perfil = this.perfilService.perfil()!;
    const v = this.form.value;
    const dto: CriarTarefaDto = {
      titulo: v.titulo!, descricao: v.descricao!,
      status: v.status as StatusTarefa, categoria: v.categoria as CategoriaTarefa,
      prioridade: v.prioridade as any, dataVencimento: v.dataVencimento!,
      anotacao: v.anotacao ?? '', destinado: v.destinado ?? '', criadoPor: perfil.matricula,
    };
    const editando = this.tarefaEditando();
    if (editando) {
      const ok = await this.tarefaService.atualizar(editando.id, dto);
      this.mostrarToast(ok ? 'Tarefa atualizada!' : 'Erro ao atualizar', ok ? 'sucesso' : 'erro');
      this.fecharDialog();
    } else {
      const ok = await this.tarefaService.criar(dto);
      this.mostrarToast(ok ? 'Tarefa criada!' : 'Erro ao criar', ok ? 'sucesso' : 'erro');
      this.form.reset({ status: StatusTarefa.AFazer, categoria: CategoriaTarefa.Administrativo, prioridade: 'media' });
    }
  }

  editarTarefa(t: Tarefa) {
    this.tarefaEditando.set(t);
    this.form.patchValue({
      titulo: t.titulo, descricao: t.descricao, status: t.status,
      categoria: t.categoria, prioridade: t.prioridade, dataVencimento: t.dataVencimento,
      anotacao: t.anotacao ?? '', horario:  t.horario ?? '', destinado: t.destinado ?? ''
    });
    this.dialogAberto.set(true);
  }

  confirmarExclusao(t: Tarefa) {
    if (confirm(`Excluir a tarefa "${t.titulo}"?`)) {
      this.tarefaService.remover(t.id).then(ok =>
        this.mostrarToast(ok ? 'Tarefa excluída!' : 'Erro ao excluir', ok ? 'sucesso' : 'erro')
      );
    }
  }

  fecharDialog() {
    this.dialogAberto.set(false);
    this.tarefaEditando.set(null);
    this.form.reset({ status: StatusTarefa.AFazer, categoria: CategoriaTarefa.Administrativo, prioridade: 'media' });
  }

  selecionarDia(dia: number | null) {
  if (!dia) return;
  const d = this.mesAtual();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const diaStr = String(dia).padStart(2, '0');
  const dataStr = `${d.getFullYear()}-${mes}-${diaStr}`;
  const hoje = new Date().toISOString().slice(0, 10);
  if (dataStr !== hoje) {
    this.diaSegundoPainel.set(dataStr);
  }
}

tarefasHoje = computed(() => {
  const hoje = new Date().toISOString().slice(0, 10);
  return this.todasParaCalendario().filter(t => t.dataVencimento === hoje);
});

tarefasSegundoPainel = computed(() => {
  return this.todasParaCalendario().filter(t => t.dataVencimento === this.diaSegundoPainel());
});

labelSegundoPainel = computed(() => {
  const dia = this.diaSegundoPainel();
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  if (dia === amanha.toISOString().slice(0, 10)) return 'amanhã';
  return dia;
});

isDiaSelecionado(dia: number): boolean {
  const diaStr = String(dia).padStart(2, '0');
  return this.dataSelecionada().endsWith('-' + diaStr);
}

temTarefaNoDia(dia: number | null): boolean {
  if (!dia) return false;
  const d = this.mesAtual();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const diaStr = String(dia).padStart(2, '0');
  const dataStr = `${d.getFullYear()}-${mes}-${diaStr}`;
  return this.todasParaCalendario().some(t => t.dataVencimento === dataStr);
}

  mesAnterior() { const d = this.mesAtual(); this.mesAtual.set(new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  proximoMes()  { const d = this.mesAtual(); this.mesAtual.set(new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
  nomeMes() { return this.mesAtual().toLocaleDateString('pt-BR', { month: 'long' }); }

  setBusca(v: string)     { this.tarefaService.termoBusca.set(v); }
  setStatus(v: string)    { this.tarefaService.filtroStatus.set(v as any); }
  setCategoria(v: string) { this.tarefaService.filtroCategoria.set(v as any); }

  exportarCsv()   { this.exportService.exportarCsv(this.tarefasFiltradas()); }
  exportarExcel() { this.exportService.exportarExcel(this.tarefasFiltradas()); }
  exportarPdf()   { this.exportService.exportarPdf(this.tarefasFiltradas()); }

  statusLabel(s: StatusTarefa) { return StatusTarefaLabel[s] ?? s; }
  categoriaLabel(c: CategoriaTarefa) { return CategoriaTarefaLabel[c] ?? c; }

  statusClasse(s: StatusTarefa) {
    const m: Record<string, string> = {
      'a-fazer': 'tag-warn', 'em-andamento': 'tag-info',
      'concluido': 'tag-success', 'cancelado': 'tag-danger'
    };
    return m[s] ?? '';
  }

  prioridadeClasse(p: string) {
    return p === 'alta' ? 'tag-danger' : p === 'media' ? 'tag-warn' : 'tag-success';
  }

  mostrarToast(texto: string, tipo: 'sucesso' | 'erro') {
    this.toastMsg.set({ texto, tipo });
    setTimeout(() => this.toastMsg.set(null), 3000);
  }

  invalido(n: string) { const c = this.form.get(n); return c?.invalid && c?.touched; }

  alternarTema(): void {
    this.temaEscuro.update(v => !v);
    document.body.classList.toggle('dark-mode', this.temaEscuro());
    const btn = document.querySelector('.btn-tema') as HTMLButtonElement;
    if (btn) btn.textContent = this.temaEscuro() ? '☀️' : '🌙';
  }
 fonteGrande = signal(false);

alternarFonte(): void {
  this.fonteGrande.update(v => !v);
  document.documentElement.style.fontSize = this.fonteGrande() ? '16px' : '14px';
}

  filtroVencimento = signal<string>('todos');
  filtroPrioridade = signal<string>('todos');

  setFiltroVencimento(v: string) { this.filtroVencimento.set(v); }
  setFiltroPrioridade(v: string) { this.filtroPrioridade.set(v); }

  tarefasTabela = computed(() => {
  const hoje = new Date().toISOString().slice(0, 10);
  const semana = new Date();
  semana.setDate(semana.getDate() + 7);
  const semanaStr = semana.toISOString().slice(0, 10);
  const mes = new Date();
  mes.setMonth(mes.getMonth() + 1);
  const mesStr = mes.toISOString().slice(0, 10);

  const v = this.filtroVencimento();
  const p = this.filtroPrioridade();
  const s = this.tarefaService.filtroStatus();

  // se nenhum filtro aplicado, mostra só hoje em diante
  const semFiltro = v === 'todos' && p === 'todos' && (s === 'todos' || !s);

  return this.todasParaCalendario()
    .filter(t => {
      if (semFiltro) return t.dataVencimento >= hoje;
      return true;
    })
    .filter(t => p === 'todos' || t.prioridade === p)
    .filter(t => {
      if (v === 'todos') return true;
      if (v === 'atrasado') return t.dataVencimento < hoje;
      if (v === 'hoje') return t.dataVencimento === hoje;
      if (v === 'semana') return t.dataVencimento >= hoje && t.dataVencimento <= semanaStr;
      if (v === 'mes') return t.dataVencimento >= hoje && t.dataVencimento <= mesStr;
      return true;
    });
});
abrirNovaTarefa(): void {
  this.tarefaEditando.set(null);
  this.form.reset({ 
    status: StatusTarefa.AFazer, 
    categoria: CategoriaTarefa.Administrativo, 
    prioridade: 'media' 
  });
  this.dialogAberto.set(true);
}
  sair(): void { this.perfilService.limpar(); this.router.navigate(['/perfil']); }
}