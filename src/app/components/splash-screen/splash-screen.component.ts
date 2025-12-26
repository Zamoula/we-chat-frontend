import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-splash-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './splash-screen.component.html',
    styleUrl: './splash-screen.component.scss'
})
export class SplashScreenComponent {
    @Input() visible: boolean = true;
}
