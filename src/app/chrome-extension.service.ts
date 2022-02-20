import { Injectable, OnDestroy } from '@angular/core';
import {
  fromEvent,
  map,
  Observable,
  forkJoin,
  take,
  switchMap,
} from 'rxjs';
import {
  ITabID,
  Format,
  IDevice,
  IScreenshot,
  ICropConfig,
  IDownloadConfig,
} from './app.types';

@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService implements OnDestroy {
  private tabId!: ITabID;
  private format!: Format;

  ngOnDestroy(): void {
    chrome.debugger.detach(this.tabId);
  }

  init(format: Format): void {
    this.format = format;
    const DEBUGGING_PROTOCOL_VERSION = '1.0';

    this.currentTab().subscribe((id) => {
      this.tabId = { tabId: id };
      chrome.debugger.attach(this.tabId, DEBUGGING_PROTOCOL_VERSION);
    });
  }

  hideScrollbars(): Observable<void> {
    const command = 'Emulation.setScrollbarsHidden';

    return new Observable((observer) => {
      chrome.debugger.sendCommand(
        this.tabId,
        command,
        {
          hidden: true,
        },
        () => observer.next()
      );
    });
  }

  resizeWrapper(
    resolution: IDevice,
    fullScreenshot?: boolean
  ): Observable<void> {
    if (!fullScreenshot) return this.resize(resolution);

    return this.resize(resolution).pipe(
      switchMap(() => this.currentHeight()),
      switchMap((height: number) => {
        resolution.height = height;
        return this.resize(resolution);
      })
    );
  }

  private resize(resolution: IDevice): Observable<void> {
    const command = 'Emulation.setDeviceMetricsOverride';

    return new Observable((observer) => {
      chrome.debugger.sendCommand(this.tabId, command, resolution, () =>
        observer.next()
      );
    });
  }

  currentHeight(): Observable<number> {
    const command = 'Page.getLayoutMetrics';

    return new Observable((observer) => {
      chrome.debugger.sendCommand(this.tabId, command, undefined, (x: any) =>
        observer.next(x.cssContentSize.height)
      );
    });
  }

  screenshot(): Observable<string> {
    const command = 'Page.captureScreenshot';

    const config: IScreenshot = {
      format: this.format,
      fromSurface: true,
    };

    return new Observable((observer) => {
      chrome.debugger.sendCommand(
        this.tabId,
        command,
        config,
        (response: any) => observer.next(response.data)
      );
    });
  }

  cropWrapper(base64: string): Observable<string[]> {
    const urlPrefix = 'data:application/octet-stream;base64,';

    const crops$: Observable<string>[] = [];
    const img = `${urlPrefix}${base64}`;

    const config: ICropConfig = {
      source: img,
      x: 0,
      y: 0,
      width: 320,
      height: 568,
    };

    const totalHeigth = 6000;
    const deviceHeight = 568;
    const unitPercent = totalHeigth / 100;
    const offset = unitPercent * 0.5;
    const copies = (totalHeigth - deviceHeight) / offset;

    for (let i = 0; i < copies; i++) {
      config.y = 0 + i * offset;
      crops$.push(this.crop({ ...config }).pipe(take(1)));
    }

    return forkJoin(crops$);
  }

  /**
   * Crop image to particular size and
   * pass callback function with new base64
   * @param imgUri
   * @param width
   * @param height
   * @return base 64 image
   */

  crop(config: ICropConfig): Observable<string> {
    const resize_canvas = document.createElement('canvas');
    const orig_src = new Image();
    orig_src.src = config.source;

    return fromEvent(orig_src, 'load').pipe(
      map(() => {
        resize_canvas.width = config.width;
        resize_canvas.height = config.height;
        resize_canvas
          .getContext('2d')
          ?.drawImage(
            orig_src,
            config.x,
            config.y,
            config.width,
            config.height,
            0,
            0,
            config.width,
            config.height
          );
        return resize_canvas.toDataURL('image/png').toString();
      })
    );
  }

  downloadWrapper(urls: string[], resolution: IDevice) {
    const downloads: Observable<void>[] = [];

    for (let i = 0; i < urls.length; i++) {
      const config: IDownloadConfig = {
        filename: `${resolution.id}.${this.format}`,
        url: urls[i],
      };

      downloads.push(this.download(config).pipe(take(1)));
    }

    return forkJoin(downloads);
  }

  download(config: IDownloadConfig): Observable<void> {
    return new Observable((observer) => {
      chrome.downloads.download(config, () => observer.next());
    });
  }

  private currentTab(): Observable<number> {
    return new Observable((observer) => {
      chrome.tabs.query({ active: true }, (tabs) => observer.next(tabs[0].id));
    });
  }
}
