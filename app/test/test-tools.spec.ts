import { config } from '../src/modules/config';
import { Tools } from '../src/modules/tools';
import { expect, assert } from 'chai'
import { ConfigInterface } from '../src/interfaces/config_interface';

const _config:ConfigInterface = config();
describe('Tools', () => {
	describe('create_id', () => {
		it('should return a string', () => {
			expect(Tools.create_id(_config)).to.be.a("string");
		});
	});
	describe('convertBase 10 to 62', () => {
		it('should return a string', () => {
			expect(Tools.convertBase(124, 10, 62)).to.be.a("string");
		})
		it('should return 20 for 124', () => {
			expect(Tools.convertBase(124, 10, 62)).be.equal('20');
		})
		it('should return 20 for 124', () => {
			expect(Tools.convertBase(124, 10, 62)).be.equal('20');
		})
		it('should return 20 for 63063360047', () => {
			expect(Tools.convertBase(63063360047, 10, 62)).be.equal('16PRqMv');
		})
	});
	describe('NotFoundException', () => {
		it('should return a Error', () => {
			expect(Tools.NotFoundException("")).to.be.a("Error");
		});
	});
	describe('InvalideTokenException', () => {
		it('should return a Error', () => {
			expect(Tools.InvalideTokenException("")).to.be.a("Error");
		});
	});
	describe('ServerError', () => {
		it('should return a Error', () => {
			expect(Tools.ServerError()).to.be.a("Error");
		});
	});
	describe('IsItExpired', () => {
		it('should return a boolean', () => {
			expect(Tools.IsItExpired(0, 0)).to.be.a("Boolean");
		});
		it('should return false', () => {
			expect(Tools.IsItExpired(new Date().valueOf(), 10)).be.equal(false);
		});
		it('should return true', () => {
			expect(Tools.IsItExpired(new Date().valueOf() - 10, 0)).be.equal(true);
		});
	});
	describe('check has role', () => {
		it('for a good string, should return a true', () => {
			const role: string = "mon_role";
			const expected: string = "mon_role";
			expect(Tools.hasRole(expected, role)).be.true;
		});
		it('for a bad string, should return a false', () => {
			const role: string = "mon_role";
			const expected: string = "mon_role_deux";
			expect(Tools.hasRole(expected, role)).be.false;
		});
		it('for a good array, should return a true', () => {
			const role: Array<string> = ["premier_role", "mon_role"];
			const expected: string = "mon_role";
			expect(Tools.hasRole(expected, role)).be.true;
		});
		it('for a bad array, should return a false', () => {
			const role: Array<string> = ["premier_role", "mon_role"];
			const expected: string = "mon_role_deux";
			expect(Tools.hasRole(expected, role)).be.false;
		});
	});
	describe('check removeProperties', () => {
		it('remove no property', () => {
			const obj: object = { "name": "berthu", "firstname": "sylvain" };
			const toremove: Array<string> = [];
			const expected: object = { "name": "berthu", "firstname": "sylvain" };
			expect(Tools.removeProperties(obj, toremove)).be.deep.equal(expected);
		});
		it('remove bad property', () => {
			const obj: object = { "name": "berthu", "firstname": "sylvain" };
			const toremove: Array<string> = ['address'];
			const expected: object = { "name": "berthu", "firstname": "sylvain" };
			expect(Tools.removeProperties(obj, toremove)).be.deep.equal(expected);
		});
		it('remove one property', () => {
			const obj: object = { "name": "berthu", "firstname": "sylvain" };
			const toremove: Array<string> = ['name'];
			const expected: object = { "firstname": "sylvain" };
			expect(Tools.removeProperties(obj, toremove)).be.deep.equal(expected);
		});
		it('remove all properties', () => {
			const obj: object = { "name": "berthu", "firstname": "sylvain" };
			const toremove: Array<string> = ['name', 'firstname'];
			const expected: object = {};
			expect(Tools.removeProperties(obj, toremove)).be.deep.equal(expected);
		});
	});
	describe('check cleanRedisIdArray', () => {
		it('with one parameters', () => {
			const ids: Array<string> = ['belink:entities:user:165:user'];
			const expected: object = [165];
			expect(Tools.cleanRedisIdArray(ids, 3, 5)).to.be.deep.equal(expected);
		});
		it('with bad size', () => {
			const ids: Array<string> = ['belink:entities:user:165:user'];
			const expected: object = [];
			expect(Tools.cleanRedisIdArray(ids, 3, 4)).to.be.deep.equal(expected);
		});
		it('with bad offset', () => {
			const ids: Array<string> = ['belink:entities:user:165:user'];
			const expected: object = [];
			expect(Tools.cleanRedisIdArray(ids, 2, 5)).to.be.deep.equal(expected);
		});
		it('with doublons', () => {
			const ids: Array<string> = ['belink:entities:user:165:user', 'belink:entities:user:165:user'];
			const expected: object = [165];
			expect(Tools.cleanRedisIdArray(ids, 3, 5)).to.be.deep.equal(expected);
		});
		it('with list of strings', () => {
			const ids: Array<string> = [
			'belink:entities:user:164:user', 
			'belink:entities:user:165', 
			'belink:entities:user:166:user:update', 
			'belink:entities:user:167', 
			'belink:entities:user:168:user', 
			'belink:entities:user:168:user'];
			const expected: object = [164,168];
			expect(Tools.cleanRedisIdArray(ids, 3, 5)).to.be.deep.equal(expected);
		});
	});
	describe('check removeDuplicatesAndNotNull', () => {
		it('with no duplicates string', () => {
			const tablo: Array<string> = ['one', 'two'];
			const expected: Array<string> = ['one', 'two'];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
		it('with no duplicates number', () => {
			const tablo: Array<number> = [1000,2000];
			const expected: Array<number> = [1000,2000];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
		it('with duplicates string', () => {
			const tablo: Array<string> = ['one', 'two', 'one'];
			const expected: Array<string> = ['one', 'two'];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
		it('with duplicates number', () => {
			const tablo: Array<number> = [1000,2000, 1000];
			const expected: Array<number> = [1000,2000];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
		it('with empty and null number', () => {
			const tablo: Array<number> = [1000,,2000, 1000, null];
			const expected: Array<number> = [1000,2000];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
		it('with empty and null string', () => {
			const tablo: Array<string> = ['one', ,'two', null, 'one'];
			const expected: Array<string> = ['one', 'two'];
			expect(Tools.removeDuplicatesAndNotNull(tablo)).to.be.deep.equal(expected);
		});
	});
});


