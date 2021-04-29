import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.authService.user.pipe(map(user => {
      if (user) {
        return true;
      } else {
        this.router.navigate(['/pages/login']);
        return false;
      }
    }))
  }
}
