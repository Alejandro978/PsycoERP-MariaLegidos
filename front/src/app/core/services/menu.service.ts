import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  order: number;
}

/**
 * Service for managing application menu items dynamically from routing configuration
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  private router = inject(Router);
  
  private menuItems = signal<MenuItem[]>([]);
  
  /**
   * Get all menu items sorted by order
   */
  readonly items = computed(() => 
    this.menuItems().sort((a, b) => a.order - b.order)
  );

  constructor() {
    this.loadMenuFromRoutes();
    
    // Listen for route changes and refresh menu
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadMenuFromRoutes();
      });
  }

  /**
   * Load menu items from router configuration
   */
  private loadMenuFromRoutes(): void {
    const routes = this.router.config;
    const menuItems: MenuItem[] = [];

    // Find main layout routes (children of empty path)
    const mainLayoutRoute = routes.find(route => 
      route.path === '' && route.children
    );

    if (mainLayoutRoute?.children) {
      for (const route of mainLayoutRoute.children) {
        const menuData = route.data?.['menu'];
        if (menuData && route.path) {
          menuItems.push({
            path: route.path,
            label: menuData.label,
            icon: menuData.icon,
            order: menuData.order || 999
          });
        }
      }
    }

    this.menuItems.set(menuItems);
  }

  /**
   * Refresh menu items from current routing configuration
   */
  refreshMenu(): void {
    this.loadMenuFromRoutes();
  }
}