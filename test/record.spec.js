/*global describe, it, before */

import chai from 'chai';
import edna from '../build/edna.js';
var fs = require('fs');


chai.expect();

const expect = chai.expect;

let data;

describe('get domy data',  () => {
  before(() => {
    data = fs.readFileSync("test/data.json");
  });
  describe('test to record', () => {
    it('should return the name', () => {
      expect(edna.name()).to.be.equal('Edna');
    });
  });
});
