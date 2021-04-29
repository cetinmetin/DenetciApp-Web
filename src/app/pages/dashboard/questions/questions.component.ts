import { Component, OnInit } from '@angular/core';
import { BlankLayoutCardComponent } from 'app/components/blank-layout-card';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent extends BlankLayoutCardComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
