import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/*';

@Component({
  selector: 'app-common-layout',
  templateUrl: './common-layout.component.html',
})
export class CommonLayoutComponent implements OnInit {

  user: any = <any>{};

  constructor(private authService: AuthService,
    private router: Router) { }
  public ngOnInit() {
    this.authService.getUserInformation().then((currentUser) => {
      this.user.name = currentUser.name
      this.user.surname = currentUser.surname
      this.user.email = currentUser.email
      this.user.identityNumber = currentUser.identityNumber
    })
  }

  public logout() {
    this.authService.logout()
  }

  
  go(page:string) {
    this.router.navigate(['app/' + page])
  }
}
