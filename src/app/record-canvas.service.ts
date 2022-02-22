import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject, switchMap, take } from 'rxjs';
import { ChromeExtensionService } from './chrome-extension.service';
import { IDownloadConfig, IRecordInput } from './app.types';

const ONE_SECOND = 1000;

@Injectable({
  providedIn: 'root',
})
export class RecordCanvasService {
  readonly startFrame = 0;
  endFrame!: number;
  framesLoaded!: number;
  currentFrame!: number;
  frameStep!: number;
  fps!: number;
  frames: HTMLImageElement[] = [];

  images!: string[];
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D | null;

  forwards = true;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(private readonly chromeExtension: ChromeExtensionService) { }

  init(config: IRecordInput): Observable<void> {
    this.images = config.images;

    this.framesLoaded = 0;
    this.currentFrame = this.startFrame;
    this.endFrame = this.images.length - 1;

    this.fps = config.fps;
    this.frameStep = ONE_SECOND / this.fps;

    const device = config.device;
    const scaleFactor = device.deviceScaleFactor;
    const width = device.width * scaleFactor;
    const height = device.height * scaleFactor;

    this.canvas = config.canvas;
    this.context = this.canvas.getContext('2d');

    this.canvas.setAttribute('width', width.toString());
    this.canvas.setAttribute('height', height.toString());

    return this.loadFrames().pipe(
      switchMap(() => {
        this.frameAnimation();
        return this.record();
      }),
      switchMap((url: string) => {
        const configDownload: IDownloadConfig = {
          filename: `${config.device.id}.webm`,
          url,
        };

        return this.chromeExtension.download(configDownload);
      }),
      take(1)
    );
  }

  private record(): Subject<string> {
    const subject = new Subject<string>();
    const recordedChunks: any[] = [];

    const stream = this.canvas.captureStream(this.fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    const animationTime = this.images.length * this.frameStep;
    mediaRecorder.start(animationTime);

    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
      // after stop `dataavilable` event run one more time
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };

    mediaRecorder.onstop = (event) => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      subject.next(url);
    };

    return subject;
  }

  private loadFrames(): Subject<void> {
    const subject = new Subject<void>();

    for (let i = this.startFrame; i <= this.endFrame; i++) {
      this.frames[i] = new Image();
      this.frames[i].src = this.images[i];

      fromEvent(this.frames[i], 'load').subscribe(() => {
        this.framesLoaded++;
        const loadedAllFrames =
          this.framesLoaded === this.endFrame - this.startFrame;

        if (loadedAllFrames) subject.next();
      });
    }

    return subject;
  }

  private async frameAnimation() {
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context?.drawImage(this.frames[this.currentFrame], 0, 0);

    await this.timer(this.frameStep);

    if (this.currentFrame == this.endFrame) {
      this.forwards = false;
    }

    if (this.currentFrame == this.startFrame) {
      this.forwards = true;
    }

    this.forwards ? this.currentFrame++ : this.currentFrame--;
    this.frameAnimation();
  }
}
