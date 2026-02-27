import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient;

  private readonly authState = signal<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  readonly user = computed(() => this.authState().user);
  readonly session = computed(() => this.authState().session);
  readonly isAuthenticated = computed(() => !!this.authState().session);
  readonly isLoading = computed(() => this.authState().loading);
  readonly role = computed(() => {
    const metadata = this.user()?.user_metadata;
    return (metadata?.['role'] as string) ?? 'user';
  });
  readonly isAdmin = computed(() => {
    const r = this.role();
    return r === 'admin' || r === 'super_admin';
  });
  readonly isSuperAdmin = computed(() => this.role() === 'super_admin');

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.initAuthListener();
  }

  private initAuthListener(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.authState.set({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.authState.set({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  async updatePassword(newPassword: string) {
    return this.supabase.auth.updateUser({ password: newPassword });
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
