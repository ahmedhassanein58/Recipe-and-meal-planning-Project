import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponent: any = null;

  setToastComponent(component: any) {
    this.toastComponent = component;
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    if (this.toastComponent) {
      this.toastComponent.show(message, type, duration);
    } else {
      // Fallback to alert if toast not initialized
      console.warn('Toast component not initialized, using alert');
      alert(message);
    }
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }
}

