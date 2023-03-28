import { RegLookup, AddressCalcLookup } from './consts/consts.js';
import { binToInt16, binToInt8 } from './helpers.js';

export function movImmedToReg(b) {
  const bytes = [b];
  function getIns() {
    if (bytes.length < 2) {
      console.error('Cannot get instruction. Not enough bytes');
      return;
    }
    const firstByte = bytes[0];
    const wField = firstByte[4];
    const binData = wField == 1 ? `${bytes[2]}${bytes[1]}` : bytes[1];
    const reg = firstByte.slice(5);
    const dest = wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0;
    return `mov ${dest}, ${wField == 1 ? binToInt16(binData) : binToInt8(binData)}`;
  }
  function insComplete() {
    if (bytes.length < 2) {
      return false;
    }

    const wField = bytes[0][4];
    if (wField == 0) {
      return true;
    }
    return bytes.length === 3;
  }
  function pushByte(b) { bytes.push(b) }

  return { getIns, insComplete, pushByte };
}

export function movRegMemToFromRegMem(b) {
  const bytes = [b];
  function getIns() {
    const firstByte = bytes[0];
    const secondByte = bytes[1];
    if (!secondByte.length) {
      console.error('Cannot get instruction. Second byte not present');
      return;
    }

    // dField: 1 = reg field in second byte is dest, 0= reg field in second byte is src
    const dField = firstByte[6];

    // wField: // 0 = byte op, 1 = word op
    const wField = firstByte[7];

    /* 00=mem mode no displacement, 01=mem mode 8-bit displacement,
       10=mem mode 16 bit displacement, 11=reg mode(no displacement)
    */
    const mod = secondByte.slice(0, 2);
    const reg = secondByte.slice(2, 5);
    const rm = secondByte.slice(5); // register/memory. when mod=11, rm idents second reg 
    let firstReg = '';
    let secondReg = '';
    if (mod == '00') {
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`;
      secondReg = `[${AddressCalcLookup[rm]}]`;
    } else if (mod == '01') {
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
      const displacement = binToInt8(bytes[2]);
      const displacementText = displacement === 0 ? '' : ` + ${displacement}`;
      secondReg = `[${AddressCalcLookup[rm]}${displacementText}]`;
    } else if (mod == '10') {
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
      const binData = `${bytes[3]}${bytes[2]}`;
      const displacement = binToInt16(binData);
      const displacementText = displacement === 0 ? '' : ` + ${displacement}`;
      secondReg = `[${AddressCalcLookup[rm]}${displacementText}]`;
    } else if (mod == '11') {
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
      secondReg = `${wField == 1 ? RegLookup[rm].W1 : RegLookup[rm].W0}`
    }

    const dest = dField == 1 ? firstReg : secondReg;
    const src = dField == 1 ? secondReg : firstReg;
    return `mov ${dest}, ${src}`;
  }
  function insComplete() {
    const secondByte = bytes[1];

    if (!secondByte) {
      return false;
    }
    // Mode. 00=memory mode no displacement, 01=mem mode 8-bit displacement, 10=mem mode 16 bit displacement, 11=reg mode(no displacement)
    const mod = secondByte.slice(0, 2);
    if (mod == '00') {
      return true;
    }
    if (mod == '01') {
      return bytes.length === 3;
    }
    if (mod == '10') {
      return bytes.length === 4;
    }
    if (mod == '11') {
      return true;// no displacement, so don't expect a third byte!
    }
  }
  function pushByte(b) {
    bytes.push(b);
  }
  return { getIns, insComplete, pushByte };
}