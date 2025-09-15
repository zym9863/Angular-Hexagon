import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HexagonBall } from './components/hexagon-ball/hexagon-ball';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HexagonBall],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Angular-Hexagon');
}
