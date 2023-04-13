import assert from 'assert';
import { getInstructionsFromBuffer } from './decoder.js';

describe('getInstructionsFromBuffer', function () {
  it('should return correct instructions from binary', function () {
    const tests = [
      {
        hex: 'b80100',
        expected: ['mov ax, 1']
      },
      {
        hex: 'bb0200',
        expected: ['mov bx, 2']
      },
      {
        // reg to reg
        hex: '89de88c6',
        expected: ['mov si, bx', 'mov dh, al']
      },
      {
        // 8 bit immed to reg
        hex: 'b10cb5f4',
        expected: ['mov cl, 12', 'mov ch, -12']
      },
      {
        // 16 bit immed to reg
        hex: 'b90c00b9f4ffba6c0fba94f0',
        expected: ['mov cx, 12', 'mov cx, -12', 'mov dx, 3948', 'mov dx, -3948']
      },
      {
        // source address calculation
        hex: '8a008b1b8b5600',
        expected: ['mov al, [bx + si]', 'mov bx, [bp + di]', 'mov dx, [bp]']
      },
      {
        // Source address calculation plus 8-bit displacement
        hex: '8a6004',
        expected: ['mov ah, [bx + si + 4]']
      },
      {
        // Source address calculation plus 16-bit displacement
        hex: '8a808713',
        expected: ['mov al, [bx + si + 4999]']
      },
      {
        // ; Dest address calculation
        hex: '8909880a886e00',
        expected: [
          'mov [bx + di], cx',
          'mov [bp + si], cl',
          'mov [bp], ch',
        ]

      }

    ];
    tests.forEach(t => {
      const buffer = Buffer.from(t.hex, 'hex');
      const instructions = getInstructionsFromBuffer(buffer);
      t.expected.forEach((ins, insI) => assert.equal(instructions[insI].insText, ins));
    });
  });
});