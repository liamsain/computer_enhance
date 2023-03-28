import { sim } from './sim.js';
import assert from 'assert';
import { getInstructionsFromBuffer } from './decoder.js';

describe('sim', function() {
  it('should update reg values correctly', function() {
    const simulator = sim();
    const hex = 'B80100BB0200B90300BA0400BC0500BD0600BE0700BF0800';
    const buffer = Buffer.from(hex, 'hex');
    const instructions = getInstructionsFromBuffer(buffer);
    for(let ins of instructions) {
      simulator.executeIns(ins);
    }
    assert.equal(simulator.getReg('ax'), 1);
    assert.equal(simulator.getReg('bx'), 2);
    assert.equal(simulator.getReg('cx'), 3);
    assert.equal(simulator.getReg('dx'), 4);
    assert.equal(simulator.getReg('sp'), 5);
    assert.equal(simulator.getReg('bp'), 6);
    assert.equal(simulator.getReg('si'), 7);
    assert.equal(simulator.getReg('di'), 8);
  });
});
