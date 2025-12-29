import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MenuService } from '../../../core/services/menu.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private menuService = inject(MenuService);

  // Sidebar state
  isSidebarOpen = signal(false);
  activeModule = signal('dashboard');

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
    const items = this.menuService.items();

    // Find the menu item that matches the current route
    // currentUrl comes with leading slash (e.g., "/patient")
    // item.path doesn't have leading slash (e.g., "patient")
    const activeItem = items.find(item => currentUrl.startsWith('/' + item.path));

    if (activeItem) {
      this.activeModule.set(activeItem.path);
    }
  }

  onModuleChange(moduleId: string): void {
    this.activeModule.set(moduleId);
    // Navigate to the corresponding route
    this.router.navigate([`/${moduleId}`]);
  }

  onSidebarToggle(): void {
    this.isSidebarOpen.update(value => !value);
  }

  onOverlayClick(): void {
    this.isSidebarOpen.set(false);
  }
}