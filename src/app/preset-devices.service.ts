import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IDevice } from './app.types';
import { devices } from './devices';

@Injectable({
  providedIn: 'root',
})
export class PresetDevicesService {
  currentDevices: IDevice[] = devices;
  devices$ = new Subject<IDevice[]>();

  constructor() { }

  init() {
    chrome.storage.sync.get('savedDevices', ({ savedDevices }) => {
      if (!savedDevices)
        chrome.storage.sync.set({ savedDevices: this.currentDevices });
      else this.currentDevices = savedDevices;
      this.devices$.next(this.currentDevices);
    });
  }

  addNewDevice(newDevice: IDevice) {
    const index = this.currentDevices.findIndex(
      (device: IDevice) => device.id === newDevice.id
    );
    if (index !== -1) return;
    this.currentDevices.push(newDevice);
    this.devices$.next(this.currentDevices);
    chrome.storage.sync.set({ savedDevices: this.currentDevices });
  }

  deleteDevice(targetDevice: IDevice) {
    const index = this.currentDevices.findIndex(
      (device: IDevice) => device.id === targetDevice.id
    );
    if (index <= -1) return;
    this.currentDevices.splice(index, 1);
    this.devices$.next(this.currentDevices);
    chrome.storage.sync.set({ savedDevices: this.currentDevices });
  }
}
