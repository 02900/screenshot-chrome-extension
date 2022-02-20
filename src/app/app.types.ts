export interface ITabID {
  tabId: number
}

export const enum Format {
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
  format?: Format,
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

export interface IRecordConfig {
  canvas: HTMLCanvasElement,
  time: number,
  images: string[],
  resolution: IDevice
}
