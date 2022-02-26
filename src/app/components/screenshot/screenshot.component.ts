import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaptureType } from '../../app.types';

@Component({
  selector: 'app-screenshot',
  templateUrl: './screenshot.component.html',
  styleUrls: ['./screenshot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenshotComponent implements OnInit {
  @Output() takeScreenshot = new EventEmitter<CaptureType>();
  @Output() takeFrames = new EventEmitter<number>();

  formFrames: FormGroup = this.fb.group({
    frames: [1, Validators.required],
  });

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void { }

  emitRequest(type: CaptureType, frames?: number): void {
    if (!frames) {
      this.takeScreenshot.emit(type);
      return;
    }

    this.takeFrames.emit(frames);
  }
}
