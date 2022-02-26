import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SelectDeviceModule } from './components/select-device/select-device.module';
import { DeviceModule } from './components/device/device.module';
import { ScreenshotModule } from './components/screenshot/screenshot.module';
import { RecorderModule } from './components/recorder/recorder.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SelectDeviceModule,
    DeviceModule,
    ScreenshotModule,
    RecorderModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
