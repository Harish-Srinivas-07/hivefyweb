"use client";

/**
 * PiP Service provides a high-fidelity 'Audio PiP' experience.
 * It attempts to use the modern 'Document Picture-in-Picture' API 
 * for a custom HTML/CSS mini-player, falling back to standard 
 * Video Picture-in-Picture if unavailable.
 */
class PiPService {
  private static instance: PiPService;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private isAutoEnabled: boolean = false;
  private currentImageUrl: string | null = null;
  private currentTitle: string | null = null;
  private currentArtist: string | null = null;
  private currentIsPlaying: boolean = false;
  private docPipWindow: any = null;

  private readonly nextIconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEHklEQVR4nO2duW8VSRCHPxaBsYW0kjkCEJiMzUlZdrkDDiPOP4FLICN2/4cNuI/AAhEQknBFYETwxJFxCgdonxchjoC1wUJvtQTQaKQysixZfs+vZ6p6pj7pl9iApn/F9HRX19SA4ziO4ziO4ziOLRYCG4HDwHngDvAMqAMjwBfRiPws+92A/NlDwAZggfYgUqIL6AVOi5nfgNCmvsm/dQrYCnRqD9IaPwErgX5gNILhU+k/4AqwBZhJhZkDHACGCjB9MmXT1n65lkpNM38A7xSNn6jsWo7KtZWa7Lb/x4DhYRK9AXZRQpYBNw0YHJrUdaCHkrBNlokhMY0Ce0iYDllOhsTVL2NJinnAQwPmhUi6D3STCItk4xNKpkFgKcb5BXhtwKyQk17LGE2yGHhlwKRQwFK1x+KcP2jAnFCQXkqi0AQdJXvghib1wMrq6JwBM4KSzmibv9OACUFZOzTTC58MGBCU9VHroXzDwOCDodxRofQqDbQhCgaVZXoLoUtpvd8AVossBmGoqOPOP5XMXzPuGn4FPhswfaKO5G1+tu59q2y+5SC8z/suOGDEfMtB2EeO1QtDCnP+VFh7JmQH/TPIgdUFD2RTi9dmKQi/5RGASwUPogbMbeH6LE1HF2Ob36m0660lGoTR2A9jrY1XAO62WK9jZTraHDMA2ofrtQTvhOMxA2DhjLeWWBAexzJ/YaQq5apNR1+B+TECsNGA8SHRO2FdjAAcNmB6SDQIB2ME4LwBw0OiQYhyZDlgwOyQ6DPhVowAPDdgdEj0TngaIwApFFvVjAYhS162zbABg0OiQfgQIwBfDJgbEg3C/x6AEgTApyB0pyB/CKP7EPZlKLrLUN+IobsR81QEuqkIT8ahm4zzdDS66eis344fyDCtA5ns1a0o+JEkLesREcmaHbn5tKRjMQOwVXEgdxOadqZb2TclXpiFbmFWhpcm0rQukAO/FzyITQlOO2NalVd5er3AQTQSLU//O6/ydK0XNNYmMu2MaS8lfEVpbSLmvyuiA+NRhYE1JgTBovmZ+iiALqXOhw3jr6nWi+zKq7Uxaxg1P/rGqxm8VQE/dBUFeqRRRai4RjR7yW0xlKoOCsrGvh1lzhgwIijpJAbokL6aoWK6B8zGCD9LCUaoiF5YbORapbaVSzFKFRq3LieB1sVlnI4GgSUkQrf01QwleuB2kxizgL9KsE/ot7TamW6fiVQ/4LCbktCTWO7omuWVTrupC83PVoUmUsqFZzWLpku6C741YPj4tX1f1b6y1yEfUasr/4/fZ6ULuiYrpCfRvwWYnhWYXZbK5dyqF1KlUzpNnQCeSIVxu4Z/ld49x2V+r9RnC9tlPrBeXnQ4C9yWwNTl7c2xz9kOy8+eyGtBZ+XvrIvVs8dxHMdxHMdxHIdIfAeZROwvT5syewAAAABJRU5ErkJggg==";

  private constructor() {
    if (typeof window !== 'undefined') {
       this.init();
    }
  }

  static getInstance(): PiPService {
    if (!PiPService.instance) {
      PiPService.instance = new PiPService();
    }
    return PiPService.instance;
  }

  private init() {
     this.video = document.createElement('video');
     this.video.muted = true;
     this.video.playsInline = true;
     this.video.loop = true;
     this.video.setAttribute('style', 'display:none; position:fixed; pointer-events:none;');
     document.body.appendChild(this.video);

     document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' || this.isActive()) {
           this.updateVisuals();
        }
     });

     this.video.onplay = () => {
        const { audioService } = require('./AudioService');
        if (audioService && !audioService.isPlaying()) audioService.resume();
     };
     this.video.onpause = () => {
        const { audioService } = require('./AudioService');
        if (audioService && audioService.isPlaying()) audioService.pause();
     };
  }

  syncPlaybackState(isPlaying: boolean) {
    this.currentIsPlaying = isPlaying;
    if (this.isActive() && this.video) {
      if (isPlaying && this.video.paused) this.video.play().catch(() => {});
      else if (!isPlaying && !this.video.paused) this.video.pause();
      this.updateVisuals();
    }
  }

  async updateMetadata(imageUrl: string, title: string, artist?: string) {
    this.currentImageUrl = imageUrl;
    this.currentTitle = title;
    this.currentArtist = artist || '';
    if (this.isActive()) this.updateVisuals();
  }

  private async updateVisuals() {
    if (this.docPipWindow) this.renderToDocPip();
    else if (document.pictureInPictureElement) await this.drawImageToCanvas();
  }

  private async drawImageToCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1280; 
      this.canvas.height = 720;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    try {
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.src = this.currentImageUrl || '';

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.clearRect(0, 0, 1280, 720);
          ctx.fillStyle = '#121212';
          ctx.fillRect(0, 0, 1280, 720);

          const artSize = 480;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(80, 120, artSize, artSize, 16);
          ctx.clip();
          ctx.drawImage(img, 80, 120, artSize, artSize);
          ctx.restore();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 64px "Inter", "Segoe UI", Roboto, sans-serif';
          ctx.fillText(this.currentTitle || '', 600, 320);

          ctx.fillStyle = '#b3b3b3';
          ctx.font = '500 36px "Inter", "Segoe UI", Roboto, sans-serif';
          ctx.fillText(this.currentArtist || 'Unknown Artist', 600, 400);

          ctx.fillStyle = this.currentIsPlaying ? '#1db954' : '#404040';
          ctx.font = '900 30px "Inter"';
          ctx.fillText(this.currentIsPlaying ? 'DISCOVERING' : 'PAUSED', 600, 480);
          
          resolve(null);
        };
        img.onerror = () => {
          ctx.fillStyle = '#181818';
          ctx.fillRect(0, 0, 1280, 720);
          resolve(null);
        };
      });
    } catch (e) {
      console.error('[PiPService] Canvas draw failed:', e);
    }
  }

  private renderToDocPip() {
    if (!this.docPipWindow) return;
    const doc = this.docPipWindow.document;
    const body = doc.body;
    
    const playSvg = `<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>`;
    const pauseSvg = `<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

    body.innerHTML = `
      <div style="
        background: #121212; 
        color: white; 
        display: flex; 
        align-items: center; 
        gap: 16px; 
        padding: 0 16px; 
        height: 100vh;
        width: 100vw;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        user-select: none;
        overflow: hidden;
        box-sizing: border-box;
      ">
        <img src="${this.currentImageUrl}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; box-shadow: 0 8px 32px rgba(0,0,0,0.8);" />
        
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; flex-direction: column; gap: 0px;">
             <div title="${this.currentTitle}" style="font-weight: 600; font-size: 14px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; letter-spacing: -0.01em;">${this.currentTitle}</div>
             <div title="${this.currentArtist}" style="font-weight: 500; font-size: 11px; color: #b3b3b3; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${this.currentArtist}</div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px; margin-bottom: 10px;">
            <button id="prevBtn" class="nav-btn" style="transform: rotate(180deg);">
              <img src="${this.nextIconBase64}" style="width: 24px; height: 24px; filter: invert(1); opacity: 0.8;" />
            </button>
            <button id="playBtn" class="play-btn">
              ${this.currentIsPlaying ? pauseSvg : playSvg}
            </button>
            <button id="nextBtn" class="nav-btn">
              <img src="${this.nextIconBase64}" style="width: 24px; height: 24px; filter: invert(1); opacity: 0.8;" />
            </button>
          </div>
        </div>
      </div>
    `;

    if (!doc.head.querySelector('style')) {
      const style = doc.createElement('style');
      style.textContent = `
        body { margin: 0; padding: 0; overflow: hidden; background: #121212; }
        .nav-btn { background: none; border: none; padding: 0; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .nav-btn:hover { transform: scale(1.1) rotate(0deg); }
        #prevBtn:hover { transform: scale(1.1) rotate(180deg); }
        .nav-btn img:hover { opacity: 1 !important; }
        .play-btn { background: #ffffff; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); color: #000000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .play-btn:hover { transform: scale(1.05); background: #f8f8f8; color: #000000 !important; }
        .play-btn:active { transform: scale(0.95); }
      `;
      doc.head.appendChild(style);
    }

    const { audioService } = require('./AudioService');
    const { usePlayerStore } = require('../store/playerStore');

    doc.getElementById('playBtn')!.onclick = () => {
      if (this.currentIsPlaying) audioService.pause();
      else audioService.resume();
    };

    doc.getElementById('nextBtn')!.onclick = () => {
      usePlayerStore.getState().nextSong();
    };

    doc.getElementById('prevBtn')!.onclick = () => {
      usePlayerStore.getState().prevSong();
    };
  }

  async enterPiP(imageUrl: string, title: string, artist?: string) {
    this.currentImageUrl = imageUrl;
    this.currentTitle = title;
    this.currentArtist = artist || '';

    if ('documentPictureInPicture' in window) {
      try {
        this.docPipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 156,
        });
        
        this.docPipWindow.addEventListener('pagehide', () => {
           this.docPipWindow = null;
        });

        this.renderToDocPip();
        return;
      } catch (e) {
        console.warn('[PiPService] Document PiP failed, falling back to Video PiP', e);
      }
    }

    if (this.video && 'requestPictureInPicture' in this.video) {
      try {
        await this.drawImageToCanvas();
        const stream = (this.canvas as any).captureStream(1);
        this.video.srcObject = stream;
        await this.video.play();
        await this.video.requestPictureInPicture();
      } catch (e) {
        console.error('[PiPService] Video PiP failed', e);
      }
    }
  }

  isActive() {
    return !!(document.pictureInPictureElement || this.docPipWindow);
  }
}

export const pipService = typeof window !== 'undefined' ? PiPService.getInstance() : null;
