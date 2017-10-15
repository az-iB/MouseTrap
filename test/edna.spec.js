/*global describe, it, before */

import chai from 'chai';
import edna from '../build/edna.js';

chai.expect();

const expect = chai.expect;

// let edna;

describe('Given an instance of my EDna',  () => {
  before(() => {
    // edna = new Edna();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(edna.name()).to.be.equal('Edna');
    });
  });
});
