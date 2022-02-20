import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { concatMap, of } from 'rxjs';
import { RecordCanvasService } from './record-canvas.service';
import { ChromeExtensionService } from './chrome-extension.service';
import { Extension, IRecordConfig } from './app.types';
import { devices } from './devices';

const delay = 2000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('canvasElement', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  canvasSize = {
    width: 0,
    height: 0
  }

  fullScreenshot: boolean = true;
  record!: boolean;
  timeToRecord: number = 2000;

  private readonly extension: Extension = Extension.PNG;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(
    private readonly recordCanvas: RecordCanvasService,
    private readonly chromeExtension: ChromeExtensionService
  ) { }

  ngOnInit(): void {
    this.chromeExtension.init(this.extension);
  }

  async generate() {
    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];

      this.canvasSize = {
        width: device.width,
        height: device.height
      }

      this.chromeExtension
        .hideScrollbars()
        .pipe(
          concatMap(() =>
            this.chromeExtension.resizeWrapper(device, this.fullScreenshot)
          ),
          concatMap(() => this.chromeExtension.screenshot()),
          concatMap((base64: string) =>
            this.chromeExtension.cropWrapper(base64, device)
          ),
          concatMap((images: string[]) => {
            const config: IRecordConfig = {
              canvas: this.canvas.nativeElement,
              time: this.timeToRecord,
              images,
              resolution: device,
            };

            this.recordCanvas.init(config);

            return of(true);
            // return this.chromeExtension.downloadWrapper(images, resolution);
          })
        )
        .subscribe();

      await this.timer(delay);
    }
  }
}
