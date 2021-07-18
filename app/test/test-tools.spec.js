const tools = require("../src/modules/tools");
const config = require("../src/modules/config").getConfig();
const assert = require('assert');
const expect = require('chai').expect;

describe('tools',function() {
  tools.init(config);
  describe('create_id', function() {
	it('should return a number', function() {
		expect(tools.create_id()).to.be.a("string");
	});
  });
   describe('convertBase 10 to 62',function() {
	it('should return a string',function() {
		expect(tools.convertBase(124, 10, 62)).to.be.a("string");
	})
	it('should return 20 for 124', function() {
		expect(tools.convertBase(124, 10, 62)).be.equal('20');
	})
	it('should return 20 for 124', function() {
		expect(tools.convertBase(124, 10, 62)).be.equal('20');
	})
	it('should return 20 for 63063360047', function() {
		expect(tools.convertBase(63063360047, 10, 62)).be.equal('16PRqMv');
	})
  });
  describe('NotFoundException', function() {
	it('should return a Error', function() {
		expect(tools.NotFoundException("")).to.be.a("Error");
	});
	it('should return a 404', function() {
		expect(tools.NotFoundException("").statusCode).be.equal(404);
	});
  });  
  describe('InvalideTokenException', function() {
	it('should return a Error', function() {
		expect(tools.InvalideTokenException("")).to.be.a("Error");
	});
	it('should return a 403', function() {
		expect(tools.InvalideTokenException("").statusCode).be.equal(403);
	});
  });  
  describe('ServerError', function() {
	it('should return a Error', function() {
		expect(tools.ServerError()).to.be.a("Error");
	});
	it('should return a 403', function() {
		expect(tools.ServerError().statusCode).be.equal(501);
	});
  });  
  describe('IsItExpired', function() {
	it('should return a boolean', function() {
		expect(tools.IsItExpired(0, 0)).to.be.a("Boolean");
	});
	it('should take a number at first', function() {
		assert.throws(_ => tools.IsItExpired("popi", 0), Error, 'tools.IsItExpired take two numbers (timestamp, nb_seconds)');
	});
	it('should take a number at second', function() {
		assert.throws(_ => tools.IsItExpired(0, "popi"), Error, 'tools.IsItExpired take two numbers (timestamp, nb_seconds)');
	});
	it('should return false', function() {
		expect(tools.IsItExpired(new Date().valueOf(), 10)).be.equal(false);
	});
	it('should return true', function() {
		expect(tools.IsItExpired(new Date().valueOf()-10, 0)).be.equal(true);
	});
  });  
});


