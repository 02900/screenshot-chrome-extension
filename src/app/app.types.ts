export interface ITabID {
  tabId: number
}

export const enum Extension {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp'
}

export interface IDevice {
  id: string,
  width: number,
  height: number,
  deviceScaleFactor: number,
  mobile: boolean,
}

export interface IScreenshot {
  format?: Extension,
  quality?: number,
  clip?: IViewport,
  fromSurface?: boolean,
  captureBeyondViewport?: boolean,
}

interface IViewport {
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
}

export interface IDownloadConfig {
  filename: string,
  url: string,
}

export interface ICropConfig {
  source: string,
  x: number,
  y: number
  width: number,
  height: number,
}

export interface IRecordInput {
  canvas: HTMLCanvasElement,
  frames: string[],
  device: IDevice,
  fps: number
}

export const enum CaptureType {
  SCREENSHOT,
  FULLSIZE_SCREENSHOT,
  FRAMES,
  RECORD,
}

export interface ICaptureConfig {
  type: CaptureType,
  frames?: number,
  fps?: number,
}

export const enum RecordStatus {
  readyToStart,
  takingScreenshot,
  processingFrames,
  generatingVideo,
}

export interface IRecorderConfig {
  frames: number,
  fps: number,
}
