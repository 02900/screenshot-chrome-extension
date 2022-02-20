import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { concat, switchMap, Observable, take, tap, of, delay } from 'rxjs';
import { RecordCanvasService } from './record-canvas.service';
import { ChromeExtensionService } from './chrome-extension.service';
import { Extension, IRecordConfig } from './app.types';
import { devices } from './devices';

const delayResize: number = 200;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('canvasElement', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  fullScreenshot: boolean = true;
  record: boolean = true;

  private readonly extension: Extension = Extension.PNG;

  constructor(
    private readonly recordCanvas: RecordCanvasService,
    private readonly chromeExtension: ChromeExtensionService
  ) { }

  ngOnInit(): void {
    this.chromeExtension.init(this.extension);
  }

  async generate() {
    const obs$: Observable<any>[] = [];

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];

      obs$.push(
        this.chromeExtension.hideScrollbars().pipe(
          tap(() => console.log('current turn: ', device.id)),
          switchMap(() =>
            this.chromeExtension
              .resizeWrapper(device, this.fullScreenshot)
              .pipe(delay(delayResize))
          ),
          switchMap(() => this.chromeExtension.screenshot()),
          switchMap((base64: string) => {
            if (this.fullScreenshot)
              return this.chromeExtension.cropWrapper(base64, device);

            return of([base64]);
          }),
          switchMap((images: string[]) => {
            if (this.record) {
              const config: IRecordConfig = {
                canvas: this.canvas.nativeElement,
                images,
                device,
              };

              return this.recordCanvas.init(config);
            }

            return this.chromeExtension.downloadWrapper(images, device);
          }),
          take(1)
        )
      );
    }

    concat(...obs$).subscribe();
  }
}
