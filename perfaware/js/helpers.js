export function binToInt8(b) {
  let num = parseInt(b, 2);
  if (num > 127) { 
    num = num - 256 
  }
  return num;
}
export function binToInt16(b) {
  let num = parseInt(b, 2);
  if (num > 32767) { 
    num = num - 65536
  }
  return num;
}