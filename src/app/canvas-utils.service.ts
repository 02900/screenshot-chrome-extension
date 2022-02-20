import { Injectable } from '@angular/core';
import { from, fromEvent, Observable, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanvasUtilsService {
  // Config
  sequencePath = 'https://stuff.nicolas.se/epiroc/hat-overview/';
  sequenceNumberLength = 3;
  fileName = 'hat-overview-';
  fileSuffix = '.png';

  canvas!: HTMLCanvasElement;

  //fps = 30;
  startFrame = 1;
  endFrame = 300;
  loop = true;
  pingPong = true;

  frames: any[] = [];
  framesLoaded = 0;

  currentFrame = this.startFrame;
  //interval = 1000/fps;
  forwards = true;

  requestID = -1;

  load(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.loadFrames().pipe(take(1)).subscribe(() => this.frameAnimation());
  }

  record(time: number): Subject<string> {
    const subject = new Subject<string>();
    const recordedChunks: any[] = [];

    const stream = this.canvas.captureStream(25 /*fps*/);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9"
    });

    //ondataavailable will fire in interval of `time || 4000 ms`
    mediaRecorder.start(time || 4000);

    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
      // after stop `dataavilable` event run one more time
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }

    mediaRecorder.onstop = (event) => {
      var blob = new Blob(recordedChunks, { type: "video/webm" });
      var url = URL.createObjectURL(blob);
      subject.next(url);
    }

    return subject;
  }

  private padWithZeroes(number: number, length: number) {
    var paddedNumber = '' + number;
    while (paddedNumber.length < length) {
      paddedNumber = '0' + paddedNumber;
    }
    return paddedNumber;
  }

  private loadFrames(): Subject<void> {
    const subject = new Subject<void>();

    for (let i = this.startFrame; i <= this.endFrame; i++) {
      this.frames[i] = new Image();

      this.frames[i].src =
        this.sequencePath +
        this.fileName +
        this.padWithZeroes(i, this.sequenceNumberLength) +
        this.fileSuffix;

      fromEvent(this.frames[i], 'load').subscribe(() => {
        this.framesLoaded++;
        const loadedAllFrames =
          this.framesLoaded >= this.endFrame - this.startFrame;
        if (loadedAllFrames) subject.next();
      });
    }

    return subject;
  }

  private frameAnimation() {
    // console.log(this.currentFrame);
    const context = this.canvas.getContext('2d');

    context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context?.drawImage(this.frames[this.currentFrame], 0, 0);

    // If last frame
    if (this.currentFrame == this.endFrame) {
      if (!this.loop) cancelAnimationFrame(this.requestID);

      if (this.pingPong) {
        this.forwards = false; // Go backwards
      } else {
        this.currentFrame = this.startFrame; // Start over
      }
      // If first frame
    } else if (this.currentFrame == this.startFrame) {
      if (this.pingPong) {
        this.forwards = true;
      }
    }

    //img.src = sequencePath + fileName + padWithZeroes(currentFrame, sequenceNumberLength) + fileSuffix;

    if (this.forwards) {
      this.currentFrame++;
    } else {
      this.currentFrame--;
    }

    this.requestID = requestAnimationFrame(() => this.frameAnimation());
  }
}
