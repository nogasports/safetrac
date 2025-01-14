import { Frame } from '@nativescript/core';
import { LoginPage } from './pages/LoginPage';

export class AppContainer extends Frame {
  constructor() {
    super();
    this.navigate({
      create: () => new LoginPage()
    });
  }
}