import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { computed, signal } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  @Input() set activeModule(value: string) {
    this._activeModule.set(value);
  }
  get activeModule(): string {
    return this._activeModule();
  }
  private _activeModule = signal<string>('');

  @Input() isOpen: boolean = false;
  @Output() moduleChange = new EventEmitter<string>();
  @Output() toggle = new EventEmitter<void>();

  // Get menu items from service using signals
  readonly menuItems = this.menuService.items;

  // Exponer nombre y iniciales del usuario desde UserService
  readonly userName = computed(() => this.userService.profile()?.name ?? '');
  readonly userInitials = computed(() => {
    const name = this.userService.profile()?.name ?? '';
    if (!name) return '';
    const parts = name.split(' ');
    const initials = parts.slice(0,2).map(p => p.charAt(0)).join('');
    return initials.toUpperCase();
  });

  ngOnInit(): void {
    // Set active module based on current route
    this.updateActiveModuleFromRoute();

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveModuleFromRoute();
      });
  }

  private updateActiveModuleFromRoute(): void {
    const currentUrl = this.router.url;
    const items = this.menuItems();

    // Find the menu item that matches the current route
    // currentUrl comes with leading slash (e.g., "/patient")
    // item.path doesn't have leading slash (e.g., "patient")
    const activeItem = items.find(item => currentUrl.startsWith('/' + item.path));

    if (activeItem) {
      this._activeModule.set(activeItem.path);
    }
  }

  onModuleChange(modulePath: string): void {
    // Navigate to the selected route
    this.router.navigate([modulePath]);

    // Update active module
    this._activeModule.set(modulePath);
    this.moduleChange.emit(modulePath);

    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      this.toggle.emit();
    }
  }

  onToggle(): void {
    this.toggle.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }

}
