import assert from 'assert';
import { getInstructionsFromBuffer } from './decoder.js';
describe('labels', function () {
  it('labels', function () {
    const tests = [
      ['7502', 'jnz 2'],
      ['75fc', 'jnz -4'],
      ['75fa', 'jnz -6'],
      ['75fc', 'jnz -4'],

      ['74fe', 'je -2'],
      ['7cfc', 'jl -4'],
      ['7efa', 'jle -6'],
      ['72f8', 'jb -8'],
      ['76f6', 'jbe -10'],
      ['7af4', 'jp -12'],
      ['70f2', 'jo -14'],
      ['78f0', 'js -16'],
      ['75ee', 'jnz -18'],
      ['7dec', 'jnl -20'],
      ['7fea', 'jg -22'],
      ['73e8', 'jnb -24'],
      ['77e6', 'ja -26'],
      ['7be4', 'jnp -28'],
      ['71e2', 'jno -30'],
      ['79e0', 'jns -32'],
      ['e2de', 'loop -34'],
      ['e1dc', 'loopz -36'],
      ['e0da', 'loopnz -38'],
      ['e3d8', 'jcxz -40'],
    ];
    tests.forEach(t => {
      const buffer = Buffer.from(t[0], 'hex');
      const instructions = getInstructionsFromBuffer(buffer);
      assert.equal(instructions[0].insText, t[1]);
    });
  });

});
describe('cmp', function () {
  it('cmps', function () {
    const tests = [
      // b132
      ['3b18', 'cmp bx, [bx + si]'],
      ['3b5e00', 'cmp bx, [bp + 0]'],
      ['83fe02', 'cmp si, 2'],
      ['83fd02', 'cmp bp, 2'],
      ['83f908', 'cmp cx, 8'],
      ['3b5e00', 'cmp bx, [bp + 0]'],
      // b149
      ['3b4f02', 'cmp cx, [bx + 2]'],
      ['3a7a04', 'cmp bh, [bp + si + 4]'],
      ['3b7b06', 'cmp di, [bp + di + 6]'],
      ['3918', 'cmp [bx + si], bx'],
      // b160
      ['395e00', 'cmp [bp + 0], bx'],
      ['394f02', 'cmp [bx + 2], cx'],
      //b169
      ['387a04', 'cmp [bp + si + 4], bh'],
      ['397b06', 'cmp [bp + di + 6], di'],
      ['803f22', 'cmp byte [bx], 34'],
      ['833ee2121d', 'cmp word [4834], 29'], //10000011, mod=00 cmp=111 rm=110
      // b183
      ['3b4600', 'cmp ax, [bp + 0]'],
      ['3a00', 'cmp al, [bx + si]'],
      ['39d8', 'cmp ax, bx'],
      ['38e0', 'cmp al, ah'],
      //b192
      ['3de803', 'cmp ax, 1000'], // 00111101, 11101000, 00000011
      ['3ce2', 'cmp al, -30'],
      //b197
      ['3c09', 'cmp al, 9'],
      // extra
      ['81fe0304', 'cmp si, 1027'],
    ];
    tests.forEach(t => {
      const buffer = Buffer.from(t[0], 'hex');
      const instructions = getInstructionsFromBuffer(buffer);
      assert.equal(instructions[0].insText, t[1]);
    });

  });
});
describe('subs', function () {
  it('subs', function () {
    const tests = [
      // b67
      ['2b18', 'sub bx, [bx + si]'], //00101011,00011000
      ['2b5e00', 'sub bx, [bp + 0]'],
      ['83ee02', 'sub si, 2'],
      ['83ed02', 'sub bp, 2'],
      ['83e908', 'sub cx, 8'],
      ['2b5e00', 'sub bx, [bp + 0]'],
      ['2b4f02', 'sub cx, [bx + 2]'],
      ['2a7a04', 'sub bh, [bp + si + 4]'],
      ['2b7b06', 'sub di, [bp + di + 6]'],
      ['2918', 'sub [bx + si], bx'], //00101001, mod=00 reg=011 rm=000
      ['295e00', 'sub [bp + 0], bx'],
      // b101
      ['294f02', 'sub [bx + 2], cx'],
      ['287a04', 'sub [bp + si + 4], bh'],
      ['297b06', 'sub [bp + di + 6], di'],
      ['802f22', 'sub byte [bx], 34'],
      ['83291d', 'sub word [bx + di], 29'],
      //b116:
      ['2b4600', 'sub ax, [bp + 0]'],
      ['2a00', 'sub al, [bx + si]'],
      ['29d8', 'sub ax, bx'],
      ['28e0', 'sub al, ah'],
      //b125:
      ['2de803', 'sub ax, 1000'],
      ['2ce2', 'sub al, -30'],
      //b130
      ['2c09', 'sub al, 9'],
      //extra: 
      ['81ee0304', 'sub si, 1027'],
    ];
    tests.forEach(t => {
      const buffer = Buffer.from(t[0], 'hex');
      const instructions = getInstructionsFromBuffer(buffer);
      assert.equal(instructions[0].insText, t[1]);
    });

  });
});
describe('adds', function () {
  it('returns correct instructions for binary add instructions', function () {
    const tests = [
      // {
      //   hex: '0318', //00000011, 00011000
      //   ex: ['add bx, [bx + si]']
      // },
      // {
      //   hex: '035e00', //00000011, 01011110
      //   ex: ['add bx, [bp + 0]']
      // },
      {
        hex: '83c602', // 10000011 = immed to reg/mem signed = 1, w = 1, 11000110
        ex: ['add si, 2']
      },
      {
        hex: '83c502', // 10000011, 11000101
        ex: ['add bp, 2']
      },
      {
        hex: '83c108',//10000011, 11000001,00001000
        ex: ['add cx, 8']
      },
      {
        hex: '034f02',
        ex: ['add cx, [bx + 2]']
      },
      {
        hex: '027a04',
        ex: ['add bh, [bp + si + 4]']
      },
      {
        hex: '037b06',
        ex: ['add di, [bp + di + 6]']
      },
      {
        hex: '0118',//00000001,00011000
        ex: ['add [bx + si], bx']
      },
      {
        // starting byte 28
        hex: '015e00',
        ex: ['add [bp + 0], bx']
      },
      {
        // starting b34
        hex: '014f02',
        ex: ['add [bx + 2], cx']
      },
      {
        hex: '007a04',
        ex: ['add [bp + si + 4], bh']
      },
      {
        // b40
        hex: '017b06',
        ex: ['add [bp + di + 6], di']
      },
      {
        hex: '800722', //10000000, mod=00 000=add rm=111, 00100010
        ex: ['add byte [bx], 34']
      },
      {
        //b46
        hex: '8382e8031d', //10000011,mod=10 000 rm=010, 11101000
        ex: ['add word [bp + si + 1000], 29']
      },
      {
        hex: '034600',
        ex: ['add ax, [bp + 0]']
      },
      {
        hex: '0200',
        ex: ['add al, [bx + si]']
      },
      {
        hex: '01d8', //0000000w=1, mod=11 reg=011 rm=000
        ex: ['add ax, bx']
      },
      {
        //b58
        hex: '00e0',
        ex: ['add al, ah']
      },
      {
        hex: '05e803',// 00000101, 11101000
        ex: ['add ax, 1000']
      },
      {
        hex: '04e2',// 00000100,11100010
        ex: ['add al, -30']
      },
      {
        hex: '0409',
        ex: ['add al, 9']
      },
      //extra:
      {
        hex: '81c60304',
        ex: ['add si, 1027']
      },
    ];
    tests.forEach(t => {
      const buffer = Buffer.from(t.hex, 'hex');
      debugger;
      const instructions = getInstructionsFromBuffer(buffer);
      t.ex.forEach((ins, insI) => assert.equal(instructions[insI].insText, ins));
    });
  })
});