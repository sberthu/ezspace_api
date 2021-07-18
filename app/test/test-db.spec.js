const db_module = require("../src/modules/db");
let config = require("../src/modules/config").getConfig();
const assert = require('assert');
const expect = require('chai').expect;

describe('db', function() {
    describe('init_internal', function() {
        it('should call connect function', function() {
			const mongoose_mock_obj = 
			{
				connect: (str_con, opt) => {
				},
				connection: {
					on: _ => {					
					}
				}
			}
            expect(db_module.init_internal(config, mongoose_mock_obj)).to.be.a('Promise');
        });
    });
    describe('init_internal', function() {
        it('check connection string', function() {
			const user=  "-user-"
			const pwd=  "-pwd-"
			const host=  "-host-"
			const port=  "-port-"
			const db =  "-db-"
			const conn_string = `mongodb://${user}:${pwd}@${host}:${port}/${db}`
			const mongoose_mock_obj = 
			{
				connect: (str_con, opt) => {
					expect(str_con).to.be.a('string');
					expect(str_con).be.equal(conn_string);
				},
				connection: {
					on: _ => {
					}
				}
			}
			config = {
				...config,
				database: {
					port,
					host,
					db,
					user,
					pwd,
				}}
            expect(db_module.init_internal(config, mongoose_mock_obj)).to.be.a('Promise');
        });
	});
    describe('init_internal', function() {
        it('check connection options', function() {
			const options = {
				test: "test"
			}
			const mongoose_mock_obj = 
			{
				connect: (str_con, opt) => {
					expect(opt).to.be.a('object');
					expect(opt).be.equal(options);
				},
				connection: {
					on: _ => {					
					}
				}
			}
			config = {
				...config,
				database: {
					...config.database,
					options
				}}
            expect(db_module.init_internal(config, mongoose_mock_obj)).to.be.a('Promise');
        });
    });	
    describe('get_connection', function() {
        it('check get_connection', function() {
			const connection = {
				on: _ => {					
				}
			}
			const mongoose_mock_obj = 
			{
				connect: (str_con, opt) => {
				},
				connection				
			}
            db_module.init_internal(config, mongoose_mock_obj)
            expect(db_module.get_connection()).to.be.a('Object');
            expect(db_module.get_connection()).be.equal(connection);
        });
    });	
});