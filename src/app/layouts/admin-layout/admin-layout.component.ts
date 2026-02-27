import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { APP_ROUTES } from '../../core/constants/app-routes';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: APP_ROUTES.ADMIN.DASHBOARD, icon: 'home' },
  { label: 'Usuários', path: APP_ROUTES.ADMIN.USERS, icon: 'users' },
  { label: 'Recursos', path: APP_ROUTES.ADMIN.APPEALS, icon: 'file-text' },
  { label: 'Financeiro', path: APP_ROUTES.ADMIN.FINANCE, icon: 'dollar-sign' },
  { label: 'Infrações CTB', path: APP_ROUTES.ADMIN.INFRACTIONS, icon: 'alert-triangle' },
  { label: 'Configurações', path: APP_ROUTES.ADMIN.SETTINGS, icon: 'settings' },
  { label: 'Logs de Auditoria', path: APP_ROUTES.ADMIN.AUDIT_LOGS, icon: 'clipboard-list' },
  { label: 'IA', path: APP_ROUTES.ADMIN.AI, icon: 'cpu' },
  { label: 'Afiliados', path: APP_ROUTES.ADMIN.AFFILIATES, icon: 'link' },
  { label: 'Cupons', path: APP_ROUTES.ADMIN.COUPONS, icon: 'tag' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200"
        [class.max-lg:-translate-x-full]="!sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-2 h-16 px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <span class="text-xl font-bold text-brand-600 dark:text-brand-400">Justifica.AI</span>
          <span class="text-xs font-medium px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">Admin</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto py-4 px-3" aria-label="Menu principal">
          <ul class="space-y-1">
            @for (item of navItems; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
                  [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  (click)="closeSidebarOnMobile()"
                >
                  <span class="w-5 h-5 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      @switch (item.icon) {
                        @case ('home') {
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        }
                        @case ('users') {
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        }
                        @case ('file-text') {
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
                        }
                        @case ('dollar-sign') {
                          <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        }
                        @case ('alert-triangle') {
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                        }
                        @case ('settings') {
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                        }
                        @case ('clipboard-list') {
                          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
                        }
                        @case ('cpu') {
                          <rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
                        }
                        @case ('link') {
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        }
                        @case ('tag') {
                          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
                        }
                      }
                    </svg>
                  </span>
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center">
              <span class="text-sm font-semibold text-brand-700 dark:text-brand-300">
                {{ userInitial() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ userEmail() }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ auth.role() }}</p>
            </div>
            <button
              (click)="onSignOut()"
              class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-20 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <!-- Main content -->
      <div class="flex-1 flex flex-col lg:ml-60">
        <!-- Header -->
        <header class="sticky top-0 z-10 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6 shrink-0">
          <button
            class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
            (click)="toggleSidebar()"
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <div class="flex-1"></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Painel Administrativo</span>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly sidebarOpen = signal(false);
  readonly navItems = NAV_ITEMS;

  readonly userEmail = computed(() => this.auth.user()?.email ?? '');
  readonly userInitial = computed(() => {
    const email = this.userEmail();
    return email ? email.charAt(0).toUpperCase() : 'A';
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  onSignOut(): void {
    this.auth.signOut();
  }
}
