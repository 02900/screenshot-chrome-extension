import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { concatMap, of } from 'rxjs';
import { CanvasUtilsService } from './canvas-utils.service';
import { ChromeExtensionService } from './chrome-extension.service';
import { Format } from './app.types';
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

  private readonly format: Format = Format.PNG;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(
    private readonly canvasUtils: CanvasUtilsService,
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
          concatMap((imagesPath: string[]) => {
            this.canvasUtils.init(this.canvas.nativeElement, 2000, imagesPath, resolution);

            return of(true);
            // return this.chromeExtension.downloadWrapper(this.images, resolution);
          })
        )
        .subscribe();

      await this.timer(delay);
    }
  }
}
