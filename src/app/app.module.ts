import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DeviceModule } from './components/device/device.module';
import { ScreenshotModule } from './components/screenshot/screenshot.module';
import { RecorderModule } from './components/recorder/recorder.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    DeviceModule,
    ScreenshotModule,
    RecorderModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
