import { JumpTypes } from './consts/consts.js';
import { binToInt8 } from './helpers.js';
export function jump(b) {
  const bytes = [b];
  function getIns() {
    return JumpTypes[bytes[0]] + ' ' + binToInt8(bytes[1]);
  }
  function insComplete() { return bytes.length == 2 }
  function pushByte(b) { bytes.push(b) }
  function getBytes() { return bytes; }

  return { getIns, insComplete, pushByte, getBytes }

}