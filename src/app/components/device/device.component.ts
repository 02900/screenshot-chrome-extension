import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDevice } from '../../app.types';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceComponent implements OnInit {
  @Input() device?: IDevice;

  deviceForm: FormGroup = this.fb.group({
    id: ['New device', Validators.required],
    mobile: [false, Validators.required],
    width: [960, Validators.required],
    height: [1440, Validators.required],
    deviceScaleFactor: [1, Validators.required],
  });

  get id(): string | undefined {
    return this.deviceForm.get('id')?.value;
  }

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    if (this.device) {
      this.deviceForm.setValue(this.device);
      this.deviceForm.get('id')?.disable();
      this.deviceForm.get('mobile')?.disable();
      this.deviceForm.get('width')?.disable();
      this.deviceForm.get('height')?.disable();
    }
  }
}
