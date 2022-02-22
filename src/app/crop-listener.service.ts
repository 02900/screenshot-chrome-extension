import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CropListenerService {
  total$: Subject<number> = new Subject();
  current$: Subject<number> = new Subject();
}
