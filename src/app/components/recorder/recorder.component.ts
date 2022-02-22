import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChromeExtensionService } from '../../chrome-extension.service';
import { IRecorderConfig, RecordStatus } from '../../app.types';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RecorderComponent implements OnInit {
  @Output() requestRecord = new EventEmitter<IRecorderConfig>();

  recordStatus: RecordStatus = RecordStatus.readyToStart;

  readonly formRecorder = this.fb.group({
    scaleFactor: [0.6, Validators.required],
    offset: [16, Validators.required],
    fps: [20, Validators.required],
  });

  constructor(
    readonly chromeExtension: ChromeExtensionService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.chromeExtension.currentFrame$.subscribe(() => {
      if (this.recordStatus === RecordStatus.takingScreenshot)
        this.recordStatus = RecordStatus.processingFrames;
      this.cdr.detectChanges();
    });
  }

  submit() {
    this.requestRecord.emit(this.formRecorder.value);
    this.recordStatus = RecordStatus.takingScreenshot;
  }
}
