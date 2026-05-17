import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit, OnDestroy {
  private timeoutId: any;
  private readonly TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  constructor(private router: Router, private ngZone: NgZone, private authService: AuthService) {}

  ngOnInit() {
    this.resetTimer();
    this.setupListeners();
  }

  ngOnDestroy() {
    this.removeListeners();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private setupListeners() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('keydown', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));
      window.addEventListener('scroll', this.resetTimer.bind(this));
    });
  }

  private removeListeners() {
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('keydown', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    window.removeEventListener('scroll', this.resetTimer.bind(this));
  }

  private resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.logout();
        });
      }, this.TIMEOUT_MS);
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}