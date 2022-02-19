import { IDevice } from "./app.types";

const iphone5: IDevice = {
  id: 'iPhone5',
  mobile: true,
  width: 320,
  height: 6000,
  deviceScaleFactor: 1,
};

const iphoneXR: IDevice = {
  id: 'iPhoneXR',
  mobile: true,
  width: 414,
  height: 896,
  deviceScaleFactor: 1,
};

const iPadMini: IDevice = {
  id: 'iPadMini',
  mobile: true,
  width: 768,
  height: 1024,
  deviceScaleFactor: 1,
};

const desktopLG: IDevice = {
  id: 'desktopLG',
  mobile: false,
  width: 1024,
  height: 768,
  deviceScaleFactor: 1,
};

const desktopXL: IDevice = {
  id: 'desktopXL',
  mobile: false,
  width: 1366,
  height: 2000,
  deviceScaleFactor: 1,
};

const desktopXXL: IDevice = {
  id: 'desktopXXL',
  mobile: false,
  width: 1440,
  height: 1024,
  deviceScaleFactor: 1,
};

const desktopXXXL: IDevice = {
  id: 'desktopXXXL',
  mobile: false,
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
};

export const resolutions: IDevice[] = [
  iphone5, desktopXL,
];
