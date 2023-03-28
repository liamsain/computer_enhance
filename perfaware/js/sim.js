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

export function sim() {
  const localRegs = Object.assign({}, Regs);
  const regNames = Object.keys(localRegs);
  function executeIns(ins) {
    const splitIns = ins.replaceAll(',', '').split(' ');
    debugger;
    const dest = splitIns[1];
    const src = splitIns[2];
    if (regNames.includes(src)) {
      // i.e. mov dx, sp
      localRegs[dest] = localRegs[src];
    } else {
      // i.e. mov ax, 1
      localRegs[dest] = src;
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
  function getReg(reg) {
    return localRegs[reg];
  }
  return { executeIns, getRegs, printRegs, getReg };
}