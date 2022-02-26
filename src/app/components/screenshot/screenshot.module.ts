import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ScreenshotComponent } from './screenshot.component';

@NgModule({
  declarations: [ScreenshotComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [ScreenshotComponent],
})
export class ScreenshotModule { }
