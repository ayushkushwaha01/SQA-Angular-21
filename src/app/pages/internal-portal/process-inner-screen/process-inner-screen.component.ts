import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-process-inner-screen',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './process-inner-screen.component.html',
  styleUrls: ['./process-inner-screen.component.scss']
})
export class ProcessInnerScreenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
