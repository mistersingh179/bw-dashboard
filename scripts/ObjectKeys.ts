const assert = require('assert');

const sym1 = Symbol('a');
const num2 = 2;

const obj = {
  b: 2,
  [sym1]: 1,
  a: 1,
  [num2]: 'c'
};

const expectedKeys = ['b', sym1.toString(), 'a', num2.toString()];
const actualKeys = Object.keys(obj);

console.log(actualKeys, expectedKeys);


export {}