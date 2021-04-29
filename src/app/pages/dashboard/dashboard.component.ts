import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import { BlankLayoutCardComponent } from 'app/components/blank-layout-card';

@Component({
  selector: 'app-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent extends BlankLayoutCardComponent {
  constructor(private route: Router) {
    super();
  }
  @HostBinding('class.mdl-grid') public readonly mdlGrid = true;
  @HostBinding('class.mdl-grid--no-spacing') public readonly mdlGridNoSpacing = true;

  go(page:string) {
    this.route.navigate(['app/' + page])
  }
}
