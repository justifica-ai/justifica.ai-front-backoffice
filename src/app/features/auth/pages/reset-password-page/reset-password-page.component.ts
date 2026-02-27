import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Redefinir senha</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">Página de redefinição de senha em construção.</p>
  `,
})
export class ResetPasswordPageComponent {}
