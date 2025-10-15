import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor  {

  constructor(private spinnerService:SpinnerService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      this.spinnerService.llamarSpinner();
      return next.handle(req).pipe(
          finalize( () => this.spinnerService.detenerSpinner())
      );

  }

  // constructor(private loader:LoadingService) {}

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  //   this.loader.show();
  //   return next.handle(request).pipe(
  //     finalize(() => {
  //       this.loader.hide();
  //     })
  //     )

  // }
}
