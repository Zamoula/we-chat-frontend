import { HttpInterceptorFn } from '@angular/common/http';
import { BYPASS_AUTH } from '../contexts/auth.context';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.context.get(BYPASS_AUTH)) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
