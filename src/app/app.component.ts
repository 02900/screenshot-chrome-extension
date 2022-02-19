import { Component } from '@angular/core';
import { resolutions } from './resolutions';

const DEBUGGING_PROTOCOL_VERSION = '1.0';
const methodEmulateDevice = 'Emulation.setDeviceMetricsOverride';
const methodScreenshot = 'Page.captureScreenshot';
const urlPrefix = 'data:application/octet-stream;base64,';
const delay = 800;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly ext = 'png';
  private readonly timer = (ms: number) => new Promise(res => setTimeout(res, ms))

  async takeScreenshots() {
    for (let i = 0; i < resolutions.length; i++) {
      const resolution = resolutions[i];

      chrome.tabs.query({ active: true }, (tabs) => {
        const tabId = { tabId: tabs[0].id };
        chrome.debugger.attach(tabId, DEBUGGING_PROTOCOL_VERSION);
        chrome.debugger.sendCommand(tabId, methodEmulateDevice, resolution, () => {
          chrome.debugger.sendCommand(
            tabId,
            methodScreenshot,
            { format: this.ext, fromSurface: true },
            (response: any) => {
              if (chrome.runtime.lastError) {
                chrome.debugger.detach(tabId);
                return;
              }

              chrome.downloads.download({
                filename: `${resolution.id}.${this.ext}`,
                url: `${urlPrefix}${response.data}`,
              });
              chrome.debugger.detach(tabId);
            }
          );
        });
      });
      await this.timer(delay);
    }
  }
}
