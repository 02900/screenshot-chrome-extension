import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DeviceComponent } from './device.component';

@NgModule({
  declarations: [DeviceComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [DeviceComponent],
})
export class DeviceModule { }
