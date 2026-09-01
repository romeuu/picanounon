import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export function loadingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const loadingService = inject(LoadingService);

  // Timer de 1000ms (1 segundo) antes de amosar o spinner
  const timer$ = timer(1000);
  let showSpinner = false;

  const timerSubscription = timer$.subscribe(() => {
    showSpinner = true;
    loadingService.show();
  });

  return next(req).pipe(
    finalize(() => {
      timerSubscription.unsubscribe();
      if (showSpinner) {
        loadingService.hide();
      }
    }),
  );
}
