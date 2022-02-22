import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingBarModule } from '../loading-bar/loading-bar.module';
import { RecorderComponent } from './recorder.component';

@NgModule({
  declarations: [RecorderComponent],
  imports: [CommonModule, ReactiveFormsModule, LoadingBarModule],
  exports: [RecorderComponent],
})
export class RecorderModule { }
