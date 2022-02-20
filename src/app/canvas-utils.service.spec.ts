import { TestBed } from '@angular/core/testing';

import { CanvasUtilsService } from './canvas-utils.service';

describe('CanvasUtilsService', () => {
  let service: CanvasUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
