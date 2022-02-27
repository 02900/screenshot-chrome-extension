import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  concat,
  switchMap,
  Observable,
  take,
  of,
  delay,
  map,
} from 'rxjs';
import { RecordCanvasService } from './record-canvas.service';
import { ChromeExtensionService } from './chrome-extension.service';
import {
  Extension,
  IRecordInput,
  IRecorderConfig,
  CaptureType,
  ICaptureConfig,
  IDevice,
} from './app.types';

const delayResize: number = 300;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('canvasElement', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  devices: IDevice[] = [];

  private readonly extension: Extension = Extension.PNG;

  constructor(
    private readonly recordCanvas: RecordCanvasService,
    private readonly chromeExtension: ChromeExtensionService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.chromeExtension.init(this.extension);
  }

  addDevice() {
    const newDevice: IDevice = {
      id: 'newDevice',
      width: 960,
      height: 1440,
      deviceScaleFactor: 1,
      mobile: false,
    };

    const index = this.devices.findIndex(
      (device: IDevice) => device.id === newDevice.id
    );

    if (index !== -1) return;

    this.devices.push(newDevice);
    this.cdr.detectChanges();
  }

  triggerDevice(targetDevice: IDevice) {
    const index = this.devices.findIndex(
      (device: IDevice) => device.id === targetDevice.id
    );

    if (index > -1) this.devices.splice(index, 1);
    else this.devices.push(targetDevice);
    this.cdr.detectChanges();
  }

  takeScreenshot(type: CaptureType) {
    this.generate({
      type,
    });
  }

  takeFrames(type: CaptureType, frames: number) {
    this.generate({
      type,
      frames,
    });
  }

  generateRecord(config: IRecorderConfig) {
    const captureConfig: ICaptureConfig = {
      type: CaptureType.RECORD,
      frames: config.frames,
      fps: config.fps,
    };

    this.generate(captureConfig);
  }

  private async generate(captureConfig: ICaptureConfig) {
    const obs$: Observable<void | void[]>[] = [];

    let originalViewport: IDevice;

    for (let i = 0; i < this.devices.length; i++) {
      const device = this.devices[i];

      obs$.push(
        this.chromeExtension.hideScrollbars().pipe(
          switchMap(() => this.chromeExtension.getViewportSize()),
          switchMap((viewportSize: any) => {
            originalViewport = {
              id: '',
              width: viewportSize.clientWidth,
              height: viewportSize.clientHeight,
              deviceScaleFactor: 1,
              mobile: device.mobile,
            };

            const resizeToFullScreen =
              captureConfig.type === CaptureType.FULLSIZE_SCREENSHOT ||
              captureConfig.type === CaptureType.FRAMES ||
              captureConfig.type === CaptureType.RECORD;

            return this.chromeExtension
              .resizeWrapper(device, resizeToFullScreen)
              .pipe(delay(delayResize));
          }),
          switchMap(() => this.chromeExtension.screenshot()),
          switchMap((base64: string) =>
            this.chromeExtension
              .resize(originalViewport)
              .pipe(map(() => base64))
          ),
          switchMap((base64: string) => {
            const urlPrefix = 'data:application/octet-stream;base64,';

            const createFrames =
              captureConfig.type === CaptureType.RECORD ||
              captureConfig.type === CaptureType.FRAMES;

            if (createFrames)
              return this.chromeExtension.cropWrapper(
                base64,
                device,
                captureConfig.frames || 2
              );

            return of([`${urlPrefix}${base64}`]);
          }),
          switchMap((frames: string[]) => {
            if (captureConfig.type === CaptureType.RECORD) {
              const config: IRecordInput = {
                canvas: this.canvas.nativeElement,
                frames: frames,
                device,
                fps: captureConfig.fps ?? 10,
              };

              return this.recordCanvas.init(config);
            }

            return this.chromeExtension.downloadWrapper(frames, device);
          }),
          take(1)
        )
      );
    }

    concat(...obs$).subscribe();
  }
}
