import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { IDevice } from '../../app.types';
import { devices } from '../../devices';

@Component({
  selector: 'app-select-device',
  templateUrl: './select-device.component.html',
  styleUrls: ['./select-device.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectDeviceComponent {
  @Output() triggerDevice = new EventEmitter<IDevice>();
  readonly devices = devices;
}
