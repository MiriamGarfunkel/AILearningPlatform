import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './welcome.html'
})
export class Welcome {}