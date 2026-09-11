import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AuthResponse } from '../models/interfaces/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse: ApiResponse<AuthResponse> = {
    success: true,
    message: 'Success',
    data: {
      accessToken: 'test-jwt-token',
      tokenType: 'Bearer',
      user: {
        id: 1,
        email: 'test@example.gal',
        name: 'Test User',
        pictureUrl: 'https://example.com/avatar.jpg',
        provider: 'LOCAL',
        role: 'ROLE_USER',
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should login and save session', () => {
    service.login({ email: 'test@example.gal', password: 'password123' }).subscribe((res) => {
      expect(res.data.accessToken).toBe('test-jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.email).toBe('test@example.gal');
      expect(service.getToken()).toBe('test-jwt-token');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should register and save session', () => {
    service.register({ email: 'new@example.gal', password: 'password123', name: 'New User' }).subscribe((res) => {
      expect(res.data.accessToken).toBe('test-jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should login with Google and save session', () => {
    service.loginWithGoogle('mock-google-id-token').subscribe((res) => {
      expect(res.data.accessToken).toBe('test-jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    const req = httpMock.expectOne('/api/auth/google');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idToken: 'mock-google-id-token' });
    req.flush(mockAuthResponse);
  });

  it('should clear session on logout', () => {
    service.saveSession(mockAuthResponse.data);
    expect(service.isAuthenticated()).toBeTrue();

    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });
});
