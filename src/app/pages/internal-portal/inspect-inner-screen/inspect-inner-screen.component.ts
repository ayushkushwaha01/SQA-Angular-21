import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inspect-inner-screen',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './inspect-inner-screen.component.html',
  styleUrls: ['./inspect-inner-screen.component.scss']
})
export class InspectInnerScreenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
