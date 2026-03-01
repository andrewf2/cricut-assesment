import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WeatherDashboardContainerComponent } from './weather/containers/weather-dashboard-container/weather-dashboard-container.component';

@Component({
    selector: 'app-root',
    imports: [WeatherDashboardContainerComponent, MatIconModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {}
