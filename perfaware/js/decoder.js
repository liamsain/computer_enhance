import { MovTypes, ArithmeticTypes, getAllJumpTypeBytes } from './consts/consts.js';
import { movRegMemToFromRegMem, movImmedToReg } from './mov.js';
import { arithmetic } from './arithmetic.js';
import { jump } from './jumps.js';
    // dField: 1 = reg field in second byte is dest, 0= reg field in second byte is src
    // const dField = firstByte[6];

    // wField: 0 = byte op, 1 = word op
    // const wField = firstByte[7];

    // sField: firstByte[6], 0=no sign extension, 1=sign extend 8-bit immed data to 16 bits if w=1

    /* mod: 
      00=mem mode no displacement,
      01=mem mode 8-bit displacement,
      10=mem mode 16 bit displacement,
      11=reg mode(no displacement)
    */

export function getInstructionsFromBuffer(buf) {
  let currentIns = null;
  const instructions = [];
  const jumpTypeBytes = getAllJumpTypeBytes();

  for (const insByte of buf) {
    const currentByte = insByte.toString(2).padStart(8, '0');
    if (currentIns) {
      currentIns.pushByte(currentByte);
      if (currentIns.insComplete()) {
        instructions.push(currentIns.getIns());
        currentIns = null;
      }
    } else {
      if (currentByte.startsWith(MovTypes.RegMemToFromRegMem)) {
        currentIns = movRegMemToFromRegMem(currentByte);
      } else if (currentByte.startsWith(MovTypes.ImmedToReg)) {
        currentIns = movImmedToReg(currentByte);
      } else if (ArithmeticTypes.Add.some(x => currentByte.startsWith(x))) {
        currentIns = arithmetic(currentByte);
      } else if(ArithmeticTypes.Sub.some(x => currentByte.startsWith(x))) {
        currentIns = arithmetic(currentByte);
      } else if(ArithmeticTypes.Cmp.some(x => currentByte.startsWith(x))) {
        currentIns = arithmetic(currentByte);
      } else if(jumpTypeBytes.includes(currentByte)) {
        currentIns = jump(currentByte);
      }

    }
  }
  return instructions;
}