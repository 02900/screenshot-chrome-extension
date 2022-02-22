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
import { CropListenerService } from '../../crop-listener.service';
import { IRecorderConfig, RecordStatus } from '../../app.types';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RecorderComponent implements OnInit {
  @Input() progress: number = 0;
  @Output() requestRecord = new EventEmitter<IRecorderConfig>();

  recordStatus: RecordStatus = 'readyToStart';

  readonly formRecorder = this.fb.group({
    scaleFactor: [0.6, Validators.required],
    offset: [16, Validators.required],
    fps: [20, Validators.required],
  });

  constructor(
    readonly cropListener: CropListenerService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cropListener.current$.subscribe(() => {
      if (this.recordStatus === 'preprocessing') this.recordStatus = 'inProgress';
      this.cdr.detectChanges();
    });
  }

  submit() {
    this.requestRecord.emit(this.formRecorder.value);
    this.recordStatus = 'preprocessing';
  }
}
