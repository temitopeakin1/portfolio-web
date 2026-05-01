import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { PreloaderComponent } from './core/preloader.component';

@Component({
  selector: 'app-root',
  imports: [PreloaderComponent, LayoutComponent],
  template: '<app-preloader /><app-layout />',
  styles: [],
})
export class App {}
