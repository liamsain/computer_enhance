const Regs = {
  ax: 0,
  bx: 0,
  cx: 0,
  dx: 0,
  sp: 0,
  bp: 0,
  si: 0,
  di: 0
};

const Flags = {
  Zero: 0,
  Signed: 0,
}
// on add, sub or cmp, if result is 0, set zero flag to 1, else 0
// for signed, check if highest value of bit is set (bit on the far left)
const OpTypes = {
  Mov: 'mov',
  Add: 'add',
  Sub: 'sub',
  Cmp: 'cmp'
};

export function sim() {
  const localRegs = Object.assign({}, Regs);
  const localFlags = Object.assign({}, Flags);
  const regNames = Object.keys(localRegs);

  function executeIns(ins) {
    const splitIns = ins.replaceAll(',', '').split(' ');
    console.log(splitIns);
    const opType = splitIns[0];
    const dest = splitIns[1];
    const src = splitIns[2];
    if (opType === OpTypes.Mov) {
      if (regNames.includes(src)) {
        // i.e. mov dx, sp
        localRegs[dest] = localRegs[src];
      } else {
        // i.e. mov ax, 1
        localRegs[dest] = src;
      }
    } else if (opType === OpTypes.Add) {
      if (regNames.includes(src)) {
        // i.e. mov dx, sp
        localRegs[dest] += localRegs[src];
      } else {
        // i.e. mov ax, 1
        localRegs[dest] += src;
      }
      localFlags.Zero = localRegs[dest] == 0 ? 1 : 0;

    } else if (opType === OpTypes.Sub) {
      if (regNames.includes(src)) {
        // i.e. mov dx, sp
        localRegs[dest] -= localRegs[src];
      } else {
        // i.e. mov ax, 1
        localRegs[dest] -= src;
      }
      localFlags.Zero = localRegs[dest] == 0 ? 1 : 0;
      
    } else if (opType === OpTypes.Cmp) {

    }
  }
  function getRegs() {
    return localRegs;
  }
  function printRegs() {
    for (let prop in localRegs) {
      console.log(prop, localRegs[prop]);
    }
  }
  function getFlags() {
    return localFlags;
  }
  function getReg(reg) {
    return localRegs[reg];
  }
  return { executeIns, getRegs, printRegs, getReg, getFlags };
}