import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject, switchMap, take } from 'rxjs';
import { IDownloadConfig, IRecordConfig } from './app.types';
import { ChromeExtensionService } from './chrome-extension.service';

@Injectable({
  providedIn: 'root',
})
export class RecordCanvasService {
  readonly startFrame = 0;
  endFrame = -1;
  framesLoaded = 0;
  currentFrame!: number;
  frames: HTMLImageElement[] = [];

  images!: string[];
  canvas!: HTMLCanvasElement;

  loop = true;
  pingPong = true;
  forwards = true;

  requestID!: number;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(private readonly chromeExtension: ChromeExtensionService) { }

  init(config: IRecordConfig): Observable<void> {
    this.requestID = -1;
    this.framesLoaded = 0;
    this.currentFrame = this.startFrame;

    this.canvas = config.canvas;
    this.canvas.setAttribute('width', config.device.width.toString());
    this.canvas.setAttribute('height', config.device.height.toString());
    this.images = config.images;
    this.endFrame = this.images.length - 1;

    return this.loadFrames()
      .pipe(
        switchMap(() => {
          this.frameAnimation();
          return this.record(config.time);
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

  private record(time: number): Subject<string> {
    const subject = new Subject<string>();
    const recordedChunks: any[] = [];

    const stream = this.canvas.captureStream(25 /*fps*/);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    //ondataavailable will fire in interval of `time || 4000 ms`
    mediaRecorder.start(time || 4000);

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
    const context = this.canvas.getContext('2d');

    context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context?.drawImage(this.frames[this.currentFrame], 0, 0);

    await this.timer(100);

    if (this.currentFrame == this.endFrame) {
      if (!this.loop) cancelAnimationFrame(this.requestID);

      if (this.pingPong) {
        this.forwards = false; // Go backwards
      } else {
        this.currentFrame = this.startFrame; // Start over
      }
    } else if (this.currentFrame == this.startFrame) {
      if (this.pingPong) {
        this.forwards = true;
      }
    }

    if (this.forwards) {
      this.currentFrame++;
    } else {
      this.currentFrame--;
    }

    this.requestID = requestAnimationFrame(() => this.frameAnimation());
  }
}
