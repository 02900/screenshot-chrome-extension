import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChromeExtensionService } from '../../chrome-extension.service';
import { RecordCanvasService } from '../../record-canvas.service';
import { IRecorderConfig, RecordStatus } from '../../app.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RecorderComponent implements OnInit, OnDestroy {
  @Output() requestRecord = new EventEmitter<IRecorderConfig>();

  recordStatus: RecordStatus = RecordStatus.readyToStart;
  progressScreenshot: number = 0;
  progressRecord: number = 0;

  readonly unsubscribe$ = new Subject<void>();

  readonly formRecorder: FormGroup = this.fb.group({
    frames: [600, Validators.required],
    fps: [30, Validators.required],
  });

  constructor(
    readonly chromeExtension: ChromeExtensionService,
    readonly recordCanvas: RecordCanvasService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listenerTakingScreenshot();
    this.listenerProcessingFrames();
    this.listenerGeneratingVideo();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submit() {
    this.requestRecord.emit(this.formRecorder.value);
    this.recordStatus = RecordStatus.takingScreenshot;
  }

  private listenerTakingScreenshot() {
    this.chromeExtension.takingScreenshot$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (this.recordStatus === RecordStatus.generatingVideo)
          this.recordStatus = RecordStatus.takingScreenshot;

        this.cdr.detectChanges();
      });
  }

  private listenerProcessingFrames() {
    this.chromeExtension.currentFrame$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((progress) => {
        if (this.recordStatus === RecordStatus.takingScreenshot)
          this.recordStatus = RecordStatus.processingFrames;

        this.progressScreenshot = progress;
        this.cdr.detectChanges();
      });
  }

  private listenerGeneratingVideo() {
    this.recordCanvas.currentFrame$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((progress) => {
        if (this.recordStatus === RecordStatus.processingFrames)
          this.recordStatus = RecordStatus.generatingVideo;

        this.progressRecord = progress;
        this.cdr.detectChanges();
      });
  }
}
