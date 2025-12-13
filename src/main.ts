import { platformBrowser,bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import {routes} from './app/app.routes';
import { provideRouter, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

// Custom title strategy to use route titles
@Injectable()
class CustomTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: any): void {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(title);
    } else {
      this.title.setTitle('Le Festin');
    }
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    Title,
    { provide: TitleStrategy, useClass: CustomTitleStrategy }
  ]
}).catch(err => console.error(err));

