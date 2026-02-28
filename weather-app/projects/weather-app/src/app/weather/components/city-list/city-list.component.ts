import { Component, input, output } from '@angular/core';
import { City } from '../../models/city.model';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrl: './city-list.component.scss',
})
export class CityListComponent {
  readonly cities = input<City[]>([]);
  readonly citySelected = output<City>();
}
