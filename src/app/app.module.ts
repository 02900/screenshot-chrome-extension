import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RecorderModule } from './components/recorder/recorder.module';
import { ScreenshotModule } from './components/screenshot/screenshot.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RecorderModule, ScreenshotModule],
  bootstrap: [AppComponent],
})
export class AppModule { }
