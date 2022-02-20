import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { concatMap, of } from 'rxjs';
import { RecordCanvasService } from './record-canvas.service';
import { ChromeExtensionService } from './chrome-extension.service';
import { Format, IRecordConfig } from './app.types';
import { resolutions } from './resolutions';

const delay = 2000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('canvasElement', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  timeToRecord: number = 2000;

  private readonly format: Format = Format.PNG;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(
    private readonly recordCanvas: RecordCanvasService,
    private readonly chromeExtension: ChromeExtensionService
  ) { }

  ngOnInit(): void {
    this.chromeExtension.init(this.format);
  }

  async generate() {
    for (let i = 0; i < resolutions.length; i++) {
      const resolution = resolutions[i];

      this.chromeExtension
        .hideScrollbars()
        .pipe(
          concatMap(() => this.chromeExtension.resize(resolution)),
          concatMap(() => this.chromeExtension.screenshot()),
          concatMap((base64: string) =>
            this.chromeExtension.cropWrapper(base64)
          ),
          concatMap((images: string[]) => {
            const config: IRecordConfig = {
              canvas: this.canvas.nativeElement,
              time: this.timeToRecord,
              images,
              resolution,
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
