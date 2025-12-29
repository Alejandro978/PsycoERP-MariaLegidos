import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {

  constructor() {}

  /**
   * Método simple para abrir WhatsApp - fallback si desktop no funciona
   */
  openWhatsApp(deeplink: string): void {
    window.open(deeplink, '_blank');
  }

  /**
   * Método directo para desktop - intenta solo la app de escritorio
   */
  openWhatsAppDesktopOnly(deeplink: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const directUrl = this.convertToDirectProtocol(deeplink);

        if (!directUrl) {
          resolve(false);
          return;
        }

        // Intentar abrir la app de escritorio
        window.location.href = directUrl;

        // Detectar si funcionó
        setTimeout(() => {
          resolve(!document.hasFocus());
        }, 2000);

      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Convertir URL web a protocolo directo whatsapp://
   */
  private convertToDirectProtocol(webUrl: string): string | null {
    try {
      const url = new URL(webUrl);
      let phone = '';
      let text = '';

      if (webUrl.includes('wa.me/')) {
        const pathParts = url.pathname.split('/');
        phone = pathParts[pathParts.length - 1];
        text = url.searchParams.get('text') || '';
      } else if (webUrl.includes('api.whatsapp.com')) {
        phone = url.searchParams.get('phone') || '';
        text = url.searchParams.get('text') || '';
      }

      if (phone) {
        let directUrl = `whatsapp://send?phone=${phone}`;
        if (text) {
          directUrl += `&text=${encodeURIComponent(decodeURIComponent(text))}`;
        }
        return directUrl;
      }

      return null;
    } catch {
      return null;
    }
  }
}