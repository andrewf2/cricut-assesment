import { Component, inject } from '@angular/core';
import { WeatherStore } from '../../state/weather.store';
import { searchCities, selectCity, clearSearch } from '../../state/weather.actions';
import { SearchInputComponent, ErrorBannerComponent } from 'lib';
import { CityListComponent } from '../../components/city-list/city-list.component';
import { City } from '../../models/city.model';

@Component({
  selector: 'app-search-container',
  imports: [SearchInputComponent, CityListComponent, ErrorBannerComponent],
  templateUrl: './search-container.component.html',
  styleUrl: './search-container.component.scss',
})
export class SearchContainerComponent {
  readonly store = inject(WeatherStore);

  onSearch(query: string): void {
    if (query.trim().length === 0) {
      this.store.dispatch(clearSearch());
    } else {
      this.store.dispatch(searchCities(query));
    }
  }

  onCitySelected(city: City): void {
    this.store.dispatch(selectCity(city));
  }
}
