import { getInstructionsFromBuffer } from './decoder.js';
import fs from 'fs';

const fileName = process.argv[2];
if (!fileName) {
  console.error('Please supply a file');
  return;
}
const buf = fs.readFileSync(fileName);
const instructionsInBuffer = getInstructionsFromBuffer(buf);
instructionsInBuffer.forEach(ins => console.log(ins));