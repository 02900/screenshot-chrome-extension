import { Injectable, OnDestroy } from '@angular/core';
import {
  fromEvent,
  map,
  Observable,
  Subject,
  forkJoin,
  take,
  switchMap,
  tap,
  of,
  concat,
  toArray,
  BehaviorSubject,
} from 'rxjs';
import {
  ITabID,
  Extension,
  IDevice,
  IScreenshot,
  ICropConfig,
  IDownloadConfig,
} from './app.types';

@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService implements OnDestroy {
  readonly totalFrames$: BehaviorSubject<number> = new BehaviorSubject(0);
  readonly currentFrame$: BehaviorSubject<number> = new BehaviorSubject(0);
  readonly takingScreenshot$: BehaviorSubject<number> = new BehaviorSubject(0);

  private tabId!: ITabID;
  private extension!: Extension;
  private contentHeight!: number;

  ngOnDestroy(): void {
    this.detach();
  }

  detach() {
    chrome.debugger.detach(this.tabId);
  }

  init(format: Extension): void {
    this.extension = format;

    chrome.runtime.connect({ name: 'popup' });

    const DEBUGGING_PROTOCOL_VERSION = '1.0';
    this.currentTab().subscribe((id) => {
      this.tabId = { tabId: id };
      chrome.debugger.attach(this.tabId, DEBUGGING_PROTOCOL_VERSION);
    });
  }

  getViewportSize(): Observable<any> {
    const command = 'Page.getLayoutMetrics';

    return new Observable((observer) => {
      chrome.debugger.sendCommand(this.tabId, command, undefined, (x: any) =>
        observer.next(x.cssVisualViewport)
      );
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

  resizeWrapper(device: IDevice, fullScreenshot?: boolean): Observable<void> {
    if (!fullScreenshot) return this.resize(device);

    return this.resize(device).pipe(
      switchMap(() => this.currentHeight()),
      switchMap((height: number) => {
        this.contentHeight = height;
        const newResolution = { ...device, height };
        return this.resize(newResolution);
      })
    );
  }

  resize(device: IDevice): Observable<void> {
    const command = 'Emulation.setDeviceMetricsOverride';

    return new Observable((observer) => {
      chrome.debugger.sendCommand(this.tabId, command, device, () =>
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
      format: this.extension,
      fromSurface: true,
    };

    this.takingScreenshot$.next(0);

    return new Observable((observer) => {
      chrome.debugger.sendCommand(
        this.tabId,
        command,
        config,
        (response: any) => observer.next(response.data)
      );
    });
  }

  cropWrapper(
    base64: string,
    device: IDevice,
    offset: number = 16
  ): Observable<string[]> {
    const urlPrefix = 'data:application/octet-stream;base64,';
    const crops$: Observable<string>[] = [];
    const img = `${urlPrefix}${base64}`;
    const scaleFactor = device.deviceScaleFactor;
    let counter: number = 0;

    const config: ICropConfig = {
      source: img,
      x: 0,
      y: 0,
      width: device.width * scaleFactor,
      height: device.height * scaleFactor,
    };

    const frames =
      ((this.contentHeight - device.height) * scaleFactor) / offset;

    this.totalFrames$.next(frames);

    for (let i = 0; i < frames; i++) {
      config.y = 0 + i * offset;
      crops$.push(this.crop({ ...config }).pipe(
        tap(() => this.currentFrame$.next(++counter)),
        take(1)));
    }

    return concat(...crops$).pipe(toArray());
  }

  /**
   * Crop image to particular size and
   * pass callback function with new base64
   * @param imgUri
   * @param width
   * @param height
   * @return base 64 image
   */

  private crop(config: ICropConfig): Observable<string> {
    const resize_canvas = document.createElement('canvas');
    const orig_src = new Image();

    return of(1).pipe(
      switchMap(() => {
        orig_src.src = config.source;
        return fromEvent(orig_src, 'load');
      }),

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
        return resize_canvas.toDataURL('image/png');
      })
    );
  }

  downloadWrapper(urls: string[], resolution: IDevice): Observable<void[]> {
    const downloads: Observable<void>[] = [];

    for (let i = 0; i < urls.length; i++) {
      const config: IDownloadConfig = {
        filename: `${resolution.id}.${this.extension}`,
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
