import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../core/services/perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private router = inject(Router);

  modo = signal<'login' | 'cadastro'>('login');
  erro = signal<string>('');

  formLogin = this.fb.group({
    matricula: ['', [Validators.required]],
    senha:     ['', [Validators.required]],
  });

  formCadastro = this.fb.group({
    nome:      ['', [Validators.required, Validators.minLength(3)]],
    cargo:     ['', [Validators.required]],
    matricula: ['', [Validators.required, Validators.minLength(4)]],
    senha:     ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit() {
    if (this.perfilService.temPerfil()) {
      this.router.navigate(['/dashboard']);
    }
  }

  entrar() {
    if (this.formLogin.invalid) { this.formLogin.markAllAsTouched(); return; }
    const { matricula, senha } = this.formLogin.value;
    const usuarios = this.carregarUsuarios();
    const user = usuarios.find(u => u.matricula === matricula && u.senha === senha);
    if (!user) {
      this.erro.set('Matrícula ou senha incorretos.');
      return;
    }
    this.perfilService.salvar({ nome: user.nome, cargo: user.cargo, matricula: user.matricula });
    this.router.navigate(['/dashboard']);
  }

  cadastrar() {
    if (this.formCadastro.invalid) { this.formCadastro.markAllAsTouched(); return; }
    const { nome, cargo, matricula, senha } = this.formCadastro.value;
    const usuarios = this.carregarUsuarios();
    if (usuarios.find(u => u.matricula === matricula)) {
      this.erro.set('Matrícula já cadastrada.');
      return;
    }
    usuarios.push({ nome: nome!, cargo: cargo!, matricula: matricula!, senha: senha! });
    localStorage.setItem('task_manager_usuarios', JSON.stringify(usuarios));
    this.perfilService.salvar({ nome: nome!, cargo: cargo!, matricula: matricula! });
    this.router.navigate(['/dashboard']);
  }

  private carregarUsuarios(): any[] {
    const salvo = localStorage.getItem('task_manager_usuarios');
    return salvo ? JSON.parse(salvo) : [];
  }

  trocarModo(m: 'login' | 'cadastro') {
    this.modo.set(m);
    this.erro.set('');
  }

  invalido(form: 'login' | 'cadastro', campo: string): boolean {
  const f = form === 'login' ? this.formLogin : this.formCadastro;
  const c = f.controls[campo as keyof typeof f.controls];
  return !!(c?.invalid && c?.touched);
}
}