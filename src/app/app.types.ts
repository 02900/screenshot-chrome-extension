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

export interface ICaptureScreenshot {
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
