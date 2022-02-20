import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { concat, switchMap, Observable, take, tap } from 'rxjs';
import { RecordCanvasService } from './record-canvas.service';
import { ChromeExtensionService } from './chrome-extension.service';
import { Extension, IRecordConfig } from './app.types';
import { devices } from './devices';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('canvasElement', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  fullScreenshot: boolean = true;
  record!: boolean;
  timeToRecord: number = 2000;

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
          tap(() => console.log("current turn: ", device.id)),
          switchMap(() =>
            this.chromeExtension.resizeWrapper(device, this.fullScreenshot)
          ),
          switchMap(() => this.chromeExtension.screenshot()),
          switchMap((base64: string) =>
            this.chromeExtension.cropWrapper(base64, device)
          ),
          switchMap((images: string[]) => {
            const config: IRecordConfig = {
              canvas: this.canvas.nativeElement,
              time: this.timeToRecord,
              images,
              device,
            };

            return this.recordCanvas.init(config);
            // return this.chromeExtension.downloadWrapper(images, resolution);
          }),
          take(1)
        )
      );
    }

    concat(...obs$).subscribe();
  }
}
