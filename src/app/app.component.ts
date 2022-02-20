import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { concatMap, fromEvent, map, Observable } from 'rxjs';
import { CanvasUtilsService } from './canvas-utils.service';
import {
  Format,
  IDevice,
  IScreenshot,
  ICropConfig,
  IDownloadConfig,
} from './app.types';
import { resolutions } from './resolutions';

const DEBUGGING_PROTOCOL_VERSION = '1.0';
const emulationDevice = 'Emulation.setDeviceMetricsOverride';
const pageScreenshot = 'Page.captureScreenshot';
const emulationHideScrollbars = 'Emulation.setScrollbarsHidden';
const urlPrefix = 'data:application/octet-stream;base64,';
const delay = 2000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('canvasElement', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private readonly ext: Format = Format.PNG;

  private readonly config: IScreenshot = {
    format: this.ext,
    fromSurface: true,
  };

  private tabId: any;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  private get currentTab(): Observable<number> {
    return new Observable((observer) => {
      chrome.tabs.query({ active: true }, (tabs) => observer.next(tabs[0].id));
    });
  }

  constructor(private readonly canvasUtils: CanvasUtilsService) { }

  ngOnInit(): void {
    this.currentTab.subscribe((id) => {
      this.tabId = { tabId: id };
      chrome.debugger.attach(this.tabId, DEBUGGING_PROTOCOL_VERSION);
    });

    this.canvasUtils.load(this.canvas.nativeElement);
  }

  ngOnDestroy(): void {
    chrome.debugger.detach(this.tabId);
  }

  record() {
    this.canvasUtils.record(1000).subscribe((x: string) => {
      this.download({
        filename: 'a.webm',
        url: x
      }).subscribe(() => {
        console.log("HERO");
      });
    });
  }

  async generate() {
    for (let i = 0; i < resolutions.length; i++) {
      const resolution = resolutions[i];

      this.hideScrollbars()
        .pipe(
          concatMap(() => this.resize(resolution)),
          concatMap(() => this.screenshot(this.config)),
          concatMap((base64: string) => {
            const img = `${urlPrefix}${base64}`;
            const config: ICropConfig = {
              source: img,
              x: 0,
              y: 0,
              width: 320,
              height: 568,
            };
            return this.crop(config);
          }),
          concatMap((img: string) => {
            const config: IDownloadConfig = {
              filename: `${resolution.id}.${this.ext}`,
              url: img,
            };

            return this.download(config);
          })
        )
        .subscribe(() => {
          console.log('Finish Him!');
        });

      await this.timer(delay);
    }
  }

  private hideScrollbars(): Observable<void> {
    return new Observable((observer) => {
      chrome.debugger.sendCommand(
        this.tabId,
        emulationHideScrollbars,
        {
          hidden: true,
        },
        () => observer.next()
      );
    });
  }

  private resize(resolution: IDevice): Observable<void> {
    return new Observable((observer) => {
      chrome.debugger.sendCommand(this.tabId, emulationDevice, resolution, () =>
        observer.next()
      );
    });
  }

  private screenshot(screenshotConfig: IScreenshot): Observable<string> {
    return new Observable((observer) => {
      chrome.debugger.sendCommand(
        this.tabId,
        pageScreenshot,
        screenshotConfig,
        (response: any) => observer.next(response.data)
      );
    });
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

  private download(config: IDownloadConfig): Observable<void> {
    return new Observable((observer) => {
      chrome.downloads.download(config, () => observer.next());
    });
  }
}
