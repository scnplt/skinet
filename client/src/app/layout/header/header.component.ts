import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BusyService } from '../../core/services/busy.service';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    MatProgressBar,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
    protected busyService = inject(BusyService);
    protected cartService = inject(CartService);
    protected accountService = inject(AccountService);
    private router = inject(Router);

    logout() {
        this.accountService.logout().subscribe({
            next: () => {
                this.accountService.currentUser.set(null);
                this.router.navigateByUrl('/');
            }
        });
    }
}
