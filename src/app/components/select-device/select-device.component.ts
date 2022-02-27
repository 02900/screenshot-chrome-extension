import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { PresetDevicesService } from '../../preset-devices.service';
import { IDevice } from '../../app.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-device',
  templateUrl: './select-device.component.html',
  styleUrls: ['./select-device.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDeviceComponent implements OnInit, OnDestroy {
  @Output() triggerDevice = new EventEmitter<IDevice>();
  @Output() addDevice = new EventEmitter<void>();
  devices!: IDevice[];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly presetDevices: PresetDevicesService
  ) { }

  ngOnInit(): void {
    this.presetDevices.devices$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((devices: IDevice[]) => {
        this.devices = devices;
        this.cdr.detectChanges();
      });

    this.presetDevices.init();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
