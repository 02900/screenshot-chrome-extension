import { TestBed } from '@angular/core/testing';

import { PresetDevicesService } from './preset-devices.service';

describe('PresetDevicesService', () => {
  let service: PresetDevicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresetDevicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
