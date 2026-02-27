import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { AiProvidersPageComponent } from '../ai-providers-page/ai-providers-page.component';
import { AiModelsPageComponent } from '../ai-models-page/ai-models-page.component';
import { AiPromptsPageComponent } from '../ai-prompts-page/ai-prompts-page.component';
import { AiPlaygroundPageComponent } from '../ai-playground-page/ai-playground-page.component';

type AiTab = 'providers' | 'models' | 'prompts' | 'playground';

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [AiProvidersPageComponent, AiModelsPageComponent, AiPromptsPageComponent, AiPlaygroundPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Inteligência Artificial</h1>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="flex gap-4" aria-label="Abas de gestão de IA">
        <button
          type="button"
          (click)="activeTab.set('providers')"
          [class]="activeTab() === 'providers'
            ? 'pb-3 px-1 text-sm font-medium border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
            : 'pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'"
          [attr.aria-selected]="activeTab() === 'providers'"
          role="tab"
        >
          Provedores
        </button>
        <button
          type="button"
          (click)="activeTab.set('models')"
          [class]="activeTab() === 'models'
            ? 'pb-3 px-1 text-sm font-medium border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
            : 'pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'"
          [attr.aria-selected]="activeTab() === 'models'"
          role="tab"
        >
          Modelos
        </button>
        <button
          type="button"
          (click)="activeTab.set('prompts')"
          [class]="activeTab() === 'prompts'
            ? 'pb-3 px-1 text-sm font-medium border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
            : 'pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'"
          [attr.aria-selected]="activeTab() === 'prompts'"
          role="tab"
        >
          Prompts
        </button>
        <button
          type="button"
          (click)="activeTab.set('playground')"
          [class]="activeTab() === 'playground'
            ? 'pb-3 px-1 text-sm font-medium border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
            : 'pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'"
          [attr.aria-selected]="activeTab() === 'playground'"
          role="tab"
        >
          Playground
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    @switch (activeTab()) {
      @case ('providers') {
        <app-ai-providers-page />
      }
      @case ('models') {
        <app-ai-models-page />
      }
      @case ('prompts') {
        <app-ai-prompts-page />
      }
      @case ('playground') {
        <app-ai-playground-page />
      }
    }
  `,
})
export class AiPageComponent {
  readonly activeTab = signal<AiTab>('providers');
}
