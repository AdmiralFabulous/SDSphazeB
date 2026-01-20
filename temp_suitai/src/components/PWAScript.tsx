'use client';

import { useEffect } from 'react';

export default function PWAScript() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
          });

          console.log('[PWA] Service Worker registered:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker?.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker is available, notify user
                console.log('[PWA] New service worker available');
                notifyUpdate();
              }
            });
          });

          // Listen for controller change (new SW activated)
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      });
    }

    // Handle install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[PWA] Install prompt available');

      // You can show a custom install button here if needed
      // For now, we'll just store it for later use
      (window as any).__PWA_INSTALL_PROMPT__ = deferredPrompt;
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      deferredPrompt = null;
      (window as any).__PWA_INSTALL_PROMPT__ = null;
    });

    // Broadcast Channel for cross-tab updates
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('pwa-updates');
      channel.addEventListener('message', (event) => {
        if (event.data.type === 'SKIP_WAITING') {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SKIP_WAITING',
            });
          }
        }
      });
    }
  }, []);

  return null;
}

function notifyUpdate() {
  // Show toast or notification about update
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #000;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

  message.innerHTML = `
    <div style="margin-bottom: 12px;">App update available!</div>
    <button onclick="window.location.reload()" style="
      background: white;
      color: black;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    ">Reload</button>
  `;

  document.body.appendChild(message);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    message.remove();
  }, 10000);
}

// Type definition for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
