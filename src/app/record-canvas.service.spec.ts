import { TestBed } from '@angular/core/testing';
import { RecordCanvasService } from './record-canvas.service';

describe('CanvasUtilsService', () => {
  let service: RecordCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
