import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-brand-600 dark:text-brand-400">Justifica.AI</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Painel Administrativo</p>
        </div>

        <!-- Content -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
          <router-outlet />
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          &copy; {{ currentYear }} Justifica.AI — Todos os direitos reservados.
        </p>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly currentYear = new Date().getFullYear();
}
