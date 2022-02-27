import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PresetDevicesService } from '../../preset-devices.service';
import { IDevice } from '../../app.types';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceComponent implements OnInit, OnDestroy {
  @Input() device!: IDevice;
  @Output() valueChanged = new EventEmitter<IDevice>();

  deviceForm: FormGroup = this.fb.group({
    id: ['newDevice', Validators.required],
    mobile: [false, Validators.required],
    width: [960, Validators.required],
    height: [1440, Validators.required],
    deviceScaleFactor: [1, Validators.required],
  });

  get id(): string | undefined {
    return this.deviceForm.get('id')?.value;
  }

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly presetDevices: PresetDevicesService
  ) { }

  ngOnInit(): void {
    if (this.device.id !== 'newDevice') {
      this.deviceForm.get('id')?.disable();
      this.deviceForm.get('mobile')?.disable();
      this.deviceForm.get('width')?.disable();
      this.deviceForm.get('height')?.disable();
      this.deviceForm.patchValue(this.device);
    }

    this.deviceForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: any) => {
        Object.assign(this.device, value)
        this.valueChanged.emit(this.device);
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  save() {
    this.presetDevices.saveDevice(this.device);
  }

  delete() {
    this.presetDevices.deleteDevice(this.device);
  }
}
