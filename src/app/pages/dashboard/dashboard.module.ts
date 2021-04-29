import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ThemeModule } from 'theme';

import { DashboardComponent } from './dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { QuestionsComponent } from './questions/questions.component';
import { MaterialModule } from './material-module'
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    FormsModule,
    MaterialModule,
    NgxSpinnerModule
  ],
  declarations: [
    DashboardComponent,
    ReportsComponent,
    QuestionsComponent,
  ],
  exports: [
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  ],
  entryComponents: [ReportsComponent],
  bootstrap: [ReportsComponent],
})
export class DashboardModule { }
