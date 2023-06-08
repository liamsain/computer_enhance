import { sim } from './sim.js';
import assert from 'assert';
import { getInstructionsFromBuffer } from './decoder.js';
import fs from 'fs';

describe('sim', function () {
  it('should update reg values with immediate values', function () {
    const simulator = sim();
    const hex = 'B80100BB0200B90300BA0400BC0500BD0600BE0700BF0800';
    const buffer = Buffer.from(hex, 'hex');
    const instructions = getInstructionsFromBuffer(buffer);
    for (let ins of instructions) {
      simulator.executeIns(ins.insText);
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
  it('should update reg values with immediate values and reg values', function () {
    const simulator = sim();
    const hex = 'B80100BB0200B90300BA040089C489DD89CE89D789E289E989F389F8';
    const buffer = Buffer.from(hex, 'hex');
    console.log(buffer);
    const instructions = getInstructionsFromBuffer(buffer);
    for (let ins of instructions) {
      simulator.executeIns(ins.insText);
    }

    assert.equal(simulator.getReg('ax'), 4);
    assert.equal(simulator.getReg('bx'), 3);
    assert.equal(simulator.getReg('cx'), 2);
    assert.equal(simulator.getReg('dx'), 1);
    assert.equal(simulator.getReg('sp'), 1);
    assert.equal(simulator.getReg('bp'), 2);
    assert.equal(simulator.getReg('si'), 3);
    assert.equal(simulator.getReg('di'), 4);
  });
  it('should update flags correctly', function () {
    const simulator = sim();
    // const fileBuffer = fs.readFileSync('../part1/test');
    const fileBuffer = fs.readFileSync('../part1/listing_0046_add_sub_cmp');

    const hexString = fileBuffer.toString('hex')
    const buffer = Buffer.from(hexString, 'hex');
    const instructions = getInstructionsFromBuffer(buffer);
    for (let ins of instructions) {
      simulator.executeIns(ins.insText);
    }
    console.log(simulator.getRegs());
    console.log(simulator.getFlags());



  });
});
