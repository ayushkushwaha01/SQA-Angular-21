// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class UserIdInterceptor implements HttpInterceptor {

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
//     // 🔥 Grab the exact UserId from your Local Storage
//     const userId = localStorage.getItem('UserId');

//     // 🔥 If it exists, attach it as a custom header called "UserId"
//     if (userId) {
//       request = request.clone({
//         setHeaders: {
//           UserId: userId
//         }
//       });
//     }

//     return next.handle(request);
//   }
// }



import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // 🔥 Grab the secure JWT Token instead of the UserId
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

    // 🔥 If the user is logged in, attach the token to the Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}