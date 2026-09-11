import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card.component';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiCardComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('googleBtnContainer')
  googleBtnContainer?: ElementRef<HTMLDivElement>;

  readonly activeTab = signal<'login' | 'register'>('login');
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);
  readonly showRegisterPassword = signal<boolean>(false);

  private googleInitInterval?: any;

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  readonly registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  constructor() {
    effect(() => {
      // Re-render Google button when theme changes
      this.themeService.theme();
      setTimeout(() => this.renderGoogleButton(), 50);
    });
  }

  ngAfterViewInit(): void {
    this.setupGoogleAuth();
  }

  ngOnDestroy(): void {
    if (this.googleInitInterval) {
      clearInterval(this.googleInitInterval);
    }
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleRegisterPasswordVisibility(): void {
    this.showRegisterPassword.update((v) => !v);
  }

  private setupGoogleAuth(): void {
    let attempts = 0;
    const maxAttempts = 20;

    const checkAndInit = () => {
      attempts++;
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        if (this.googleInitInterval) {
          clearInterval(this.googleInitInterval);
        }
        this.initGoogleClient();
      } else if (attempts >= maxAttempts) {
        if (this.googleInitInterval) {
          clearInterval(this.googleInitInterval);
        }
      }
    };

    checkAndInit();
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      this.googleInitInterval = setInterval(checkAndInit, 300);
    }
  }

  private initGoogleClient(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => {
          if (response?.credential) {
            this.handleGoogleLogin(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.renderGoogleButton();
    } catch (e) {
      console.warn('Google Identity Services initialization notice:', e);
    }
  }

  renderGoogleButton(): void {
    const container =
      document.getElementById('google-btn') ||
      this.googleBtnContainer?.nativeElement;
    if (container && typeof google !== 'undefined' && google?.accounts?.id) {
      container.innerHTML = '';
      const isDark = this.themeService.theme() === 'dark';
      google.accounts.id.renderButton(container, {
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 300,
      });
    }
  }

  handleGoogleLogin(idToken: string): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: (res) => {
        this.successMessage.set('Sessión iniciada correctamente con Google.');
        this.redirectAfterLogin();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ||
          'Erro ao autenticar con Google. Comproba a túa conta ou téntao de novo.';
        this.errorMessage.set(errorMsg);
      },
    });
  }

  handleLocalLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage.set('Benvido/a de novo!');
        this.redirectAfterLogin();
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          'Credenciais incorrectas. Revisa o correo electrónico e o contrasinal.';
        this.errorMessage.set(msg);
      },
    });
  }

  handleLocalRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage.set(
          'Conta creada con éxito! Benvido/a a Picanounon.',
        );
        this.redirectAfterLogin();
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          'Erro ao rexistrar a conta. É posible que o correo xa estea en uso.';
        this.errorMessage.set(msg);
      },
    });
  }

  private redirectAfterLogin(): void {
    setTimeout(() => {
      const returnUrl =
        this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      this.router.navigateByUrl(returnUrl);
    }, 1000);
  }
}
