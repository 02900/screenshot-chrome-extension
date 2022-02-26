import { IDevice } from "./app.types";

const iphone5: IDevice = {
  id: 'iPhone5',
  mobile: true,
  width: 320,
  height: 568,
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

const d1024x576: IDevice = {
  id: 'desktopLG',
  mobile: false,
  width: 1024,
  height: 576,
  deviceScaleFactor: 1,
};

const d1366x768: IDevice = {
  id: 'desktopXL',
  mobile: false,
  width: 1366,
  height: 768,
  deviceScaleFactor: 1,
};

const d1440x900: IDevice = {
  id: 'desktopXXL',
  mobile: false,
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
};

const d1920x1080: IDevice = {
  id: 'desktopXXXL',
  mobile: false,
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
};

export const devices: IDevice[] = [
  iphone5, iphoneXR
];
