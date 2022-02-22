import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
export class RecorderComponent implements OnInit {
  @Output() requestRecord = new EventEmitter<IRecorderConfig>();

  recordStatus: RecordStatus = RecordStatus.readyToStart;
  progressScreenshot: number = 0;
  progressRecord: number = 0;

  readonly unsubscribe$ = new Subject<void>();

  readonly formRecorder = this.fb.group({
    scaleFactor: [0.6, Validators.required],
    offset: [16, Validators.required],
    fps: [30, Validators.required],
  });

  constructor(
    readonly chromeExtension: ChromeExtensionService,
    readonly recordCanvas: RecordCanvasService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listenerProcessingFrames();
    this.listenerGeneratingVideo();
  }

  submit() {
    this.requestRecord.emit(this.formRecorder.value);
    this.recordStatus = RecordStatus.takingScreenshot;
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
