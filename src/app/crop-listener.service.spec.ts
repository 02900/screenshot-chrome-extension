import { TestBed } from '@angular/core/testing';

import { CropListenerService } from './crop-listener.service';

describe('CropListenerService', () => {
  let service: CropListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CropListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
