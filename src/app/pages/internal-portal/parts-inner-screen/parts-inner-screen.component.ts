import { Component, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-parts-inner-screen",
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: "./parts-inner-screen.component.html",
  styleUrls: ["./parts-inner-screen.component.scss"],
})
export class PartsInnerScreenComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
