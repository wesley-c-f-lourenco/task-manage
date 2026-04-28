import { Component, inject, OnInit } from '@angular/core';
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

  form = this.fb.group({
    nome:      ['', [Validators.required, Validators.minLength(3)]],
    cargo:     ['', [Validators.required]],
    matricula: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit() {
    if (this.perfilService.temPerfil()) {
      this.router.navigate(['/dashboard']);
    }
  }

  salvar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.perfilService.salvar(this.form.value as any);
    this.router.navigate(['/dashboard']);
  }

  invalido(name: string) {
    const c = this.form.get(name);
    return c?.invalid && c?.touched;
  }
}