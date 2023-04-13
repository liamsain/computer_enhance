import { RegLookup, AddressCalcLookup } from './consts/consts.js';
import { binToInt16, binToInt8 } from './helpers.js';
const ImmedToRegMem = '100000';
const AddTypes = {
  RegMemWithRegToEither: '000000',
  ImmedToRegMem: '100000',
  ImmedToAccum: '0000010'
};

const SubTypes = {
  RegMemWithRegToEither: '001010',
  ImmedToRegMem: '100000',
  ImmedToAccum: '0010110'
};
const CmpTypes = {
  RegMemWithRegToEither: '001110',
  ImmedToRegMem: '100000',
  ImmedToAccum: '0011110'
};
function getAction(firstByte, secondByte) {
  let action = 'add';
  if (firstByte.startsWith(SubTypes.RegMemWithRegToEither) || firstByte.startsWith(SubTypes.ImmedToAccum)) {
    action = 'sub'
  }
  if (firstByte.startsWith(CmpTypes.RegMemWithRegToEither) || firstByte.startsWith(CmpTypes.ImmedToAccum)) {
    action = 'cmp'
  }

  if (firstByte.startsWith(ImmedToRegMem)) {
    const identifier = secondByte.slice(2, 5);
    if (identifier == '101') {
      action = 'sub';
    } else if (identifier == '111') {
      action = 'cmp';
    }
  }
  return action;

}
export function arithmetic(b) {
  const bytes = [b];
  function getIns() {
    const firstByte = bytes[0];
    const secondByte = bytes[1];
    if (!secondByte.length) {
      console.error('Cannot get instruction. Second byte not present');
      return `error getting instructions for bytes ${bytes}`;
    }
    const action = getAction(firstByte, secondByte);

    if (firstByte.startsWith(AddTypes.ImmedToAccum) || firstByte.startsWith(SubTypes.ImmedToAccum) || firstByte.startsWith(CmpTypes.ImmedToAccum)) {
      let toAdd = '';
      let dest = '';
      if (bytes[0][7] == 1) {
        toAdd = binToInt16(`${bytes[2]}${bytes[1]}`);
        dest = 'ax';
      } else {
        toAdd = binToInt8(bytes[1]);
        dest = 'al';
      }
      return `${action} ${dest}, ${toAdd}`;
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
      if (firstByte.startsWith(ImmedToRegMem)) {
        if (rm == '110') {
          const binData = `${bytes[3]}${bytes[2]}`;
          const displacement = binToInt16(binData);
          firstReg = `word [${displacement}]`;
          secondReg = binToInt8(bytes[4]);
        } else {
          firstReg = wField == 1 ? 'word ' + secondReg : 'byte ' + secondReg;
          secondReg = binToInt8(bytes[2]);
        }
      }

    } else if (mod == '01') {
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
      const displacement = binToInt8(bytes[2]);
      const displacementText = ` + ${displacement}`;
      secondReg = `[${AddressCalcLookup[rm]}${displacementText}]`;
    } else if (mod == '10') {
      const binData = `${bytes[3]}${bytes[2]}`;
      const displacement = binToInt16(binData);
      const displacementText = ` + ${displacement}`;
      firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
      secondReg = `[${AddressCalcLookup[rm]}${displacementText}]`;

      if (firstByte.startsWith(ImmedToRegMem)) {
        firstReg = wField == 1 ? 'word ' + secondReg : 'byte ' + secondReg;
        secondReg = binToInt8(bytes[4]);
      }

    } else if (mod == '11') {
      if (firstByte.startsWith(ImmedToRegMem)) {
        firstReg = `${wField == 1 ? RegLookup[rm].W1 : RegLookup[rm].W0}`
        if (firstByte[6] == 0 && firstByte[7] == 1) {
          const binData = `${bytes[3]}${bytes[2]}`
          secondReg = binToInt16(binData);
        } else {
          secondReg = binToInt8(bytes[2]);
        }


      } else {
        firstReg = `${wField == 1 ? RegLookup[reg].W1 : RegLookup[reg].W0}`
        secondReg = `${wField == 1 ? RegLookup[rm].W1 : RegLookup[rm].W0}`
      }
    }
    let dest = firstReg;
    let src = secondReg;
    if (firstByte.startsWith(AddTypes.RegMemWithRegToEither) || firstByte.startsWith(SubTypes.RegMemWithRegToEither) || firstByte.startsWith(CmpTypes.RegMemWithRegToEither)) {
      dest = dField == 1 ? firstReg : secondReg;
      src = dField == 1 ? secondReg : firstReg;
    }
    return `${action} ${dest}, ${src}`;
  }
  function insComplete() {
    if (bytes.length < 2) {
      return false;
    }
    const firstByte = bytes[0];
    const secondByte = bytes[1];
    if (firstByte.startsWith(AddTypes.ImmedToAccum) || firstByte.startsWith(SubTypes.ImmedToAccum) || firstByte.startsWith(CmpTypes.ImmedToAccum)) {
      return firstByte[7] == 1 ? bytes.length == 3 : bytes.length == 2;
    }
    const mod = secondByte.slice(0, 2);
    const rm = secondByte.slice(5); // register/memory. 
    if (mod == '00') {
      if (firstByte.startsWith(ImmedToRegMem)) {
        if (rm == '110') {
          return bytes.length == 5
        }
        return bytes.length == 3;
      } else {
        return true;
      }
    }
    if (mod == '01') {
      return bytes.length == 3;
    }
    if (mod == '10') {
      if (firstByte.startsWith(ImmedToRegMem)) {
        return bytes.length == 5;
      }

      return bytes.length == 4;
    }
    if (mod == '11') {
      if (firstByte.startsWith(ImmedToRegMem)) {
        // s=1 then if w = 1, extend immed data to 16
        if (firstByte[6] == 0 && firstByte[7] == 1) {
          return bytes.length == 4
        }
      }

      if (firstByte[6] == 1) {
        return bytes.length == 3;
      }

      return bytes.length == 2;
    }
    return true;

  }
  function pushByte(b) {
    bytes.push(b);
  }
  function getBytes() {
    return bytes;
  }
  return { getIns, insComplete, pushByte, getBytes };
}