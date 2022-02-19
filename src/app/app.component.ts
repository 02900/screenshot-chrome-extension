import { Component } from '@angular/core';

const DEBUGGING_PROTOCOL_VERSION = '1.0';
const methodEmulateDevice = 'Emulation.setDeviceMetricsOverride';
const methodScreenshot = 'Page.captureScreenshot';
const urlPrefix = 'data:application/octet-stream;base64,';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly iphone5 = {
    id: 'iPhone5',
    mobile: true,
    width: 320,
    height: 568,
    deviceScaleFactor: 1,
  };

  readonly ext = 'png';

  resize() {
    chrome.tabs.query({ active: true }, (tabs) => {
      const tabId = { tabId: tabs[0].id };
      chrome.debugger.attach(tabId, DEBUGGING_PROTOCOL_VERSION);
      chrome.debugger.sendCommand(tabId, methodEmulateDevice, this.iphone5, () => {
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
              filename: `${this.iphone5.id}.${this.ext}`,
              url: `${urlPrefix}${response.data}`,
            });
            chrome.debugger.detach(tabId);
          }
        );
      });
    });
  }
}
