import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LayoutsModule } from './layouts';
import { CommonLayoutComponent } from './layouts/common-layout';
import { DashboardComponent } from './pages/dashboard';
import { AuthGuard } from '../app/services/auth/auth.guard';
import { LoginComponent } from '../app/pages/pages/login/login.component'
import { ReportsComponent } from 'app/pages/dashboard/reports/reports.component'
import { QuestionsComponent } from 'app/pages/dashboard/questions/questions.component'
import { ErrorComponent } from 'app/pages/pages/error/error.component'

// @ts-ignore
// @ts-ignore
// @ts-ignore
@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
        {
          path: 'app', component: CommonLayoutComponent, children: [
            { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
            { path: 'reports', component: ReportsComponent, pathMatch: 'full' },
            { path: 'questions', component: QuestionsComponent, pathMatch: 'full' },
          ], canActivate: [AuthGuard]
        }, // add 'canActivate: AuthGuard' for catching unauth users

        { path: 'pages', loadChildren: () => import('./pages/pages/pages.module').then(m => m.PagesModule) },
        { path: '**', redirectTo: '/pages/404' },
      ]
    ),
    LayoutsModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
