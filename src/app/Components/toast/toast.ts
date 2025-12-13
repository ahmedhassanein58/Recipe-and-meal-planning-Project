import { Component, signal, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../Services/toast.service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  standalone: true
})
export class Toast implements OnInit, OnDestroy {
  message = signal('');
  type = signal<ToastType>('info');
  visible = signal(false);
  private timeoutId: any = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.setToastComponent(this);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);
    
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    this.visible.set(false);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getIcon(): string {
    switch (this.type()) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}

