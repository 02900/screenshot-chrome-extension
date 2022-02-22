import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  BehaviorSubject,
  switchMap,
  take,
  fromEvent,
} from 'rxjs';
import { ChromeExtensionService } from './chrome-extension.service';
import { IDownloadConfig, IRecordInput } from './app.types';

const ONE_SECOND = 1000;

@Injectable({
  providedIn: 'root',
})
export class RecordCanvasService {
  readonly totalFrames$: BehaviorSubject<number> = new BehaviorSubject(0);
  readonly currentFrame$: BehaviorSubject<number> = new BehaviorSubject(0);

  currentFrame!: number;
  frameStep!: number;
  fps!: number;

  frames!: string[];
  images!: HTMLImageElement[];

  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D | null;

  mediaRecorder!: MediaRecorder;

  private readonly timer = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

  constructor(private readonly chromeExtension: ChromeExtensionService) { }

  init(config: IRecordInput): Observable<void> {
    this.frames = config.frames;
    this.images = [];

    this.currentFrame = 0;
    this.totalFrames$.next(this.frames.length);

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

    const stream = this.canvas.captureStream(this.fps);

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

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

    this.mediaRecorder.start();

    this.mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
    };

    this.mediaRecorder.onstop = (event) => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      subject.next(url);
    };

    return subject;
  }

  private loadFrames(): Subject<void> {
    const subject = new Subject<void>();
    let imagesLoaded: number = 0;

    for (let i = 0; i < this.frames.length; i++) {
      this.images[i] = new Image();
      this.images[i].src = this.frames[i];

      fromEvent(this.images[i], 'load').subscribe(() => {
        const loadedAll = ++imagesLoaded === this.frames.length;
        if (loadedAll) subject.next();
      });
    }

    return subject;
  }

  private async frameAnimation() {
    while (this.currentFrame < this.frames.length) {
      this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context?.drawImage(this.images[this.currentFrame], 0, 0);
      this.currentFrame$.next(++this.currentFrame);
      await this.timer(this.frameStep);
    }

    this.currentFrame$.next(++this.currentFrame);

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }
}
