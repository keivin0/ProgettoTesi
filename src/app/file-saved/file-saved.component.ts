import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-saved',
  templateUrl: './file-saved.component.html',
  styleUrl: './file-saved.component.css',
})
export class FileSavedComponent {
  constructor(private routes: Router) {}

  goToHomePage() {
    this.routes.navigate(['home']);
  }
}
