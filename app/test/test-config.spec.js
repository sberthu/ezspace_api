const config = require("../src/modules/config").getConfig();
const assert = require('assert');
const expect = require('chai').expect;

describe('config', function() {
    describe('trace', function() {
        it('should return a function', function() {
            expect(config.trace).to.be.a("Function");
        })
    })
    describe('is_production', function() {
        it('should return a boolean', function() {
            expect(config.is_production).to.be.a("boolean");
        })
    })
    describe('timestamp', function() {
        it('should return a date', function() {
            expect(config.timestamp).to.be.a("Date");
        })
    })
    describe('port', function() {
        it('should return a number', function() {
            expect(config.port).to.be.a("number");
        })
    })
    describe('api_version', function() {
        it('should return a string', function() {
            expect(config.api_version).to.be.a("string");
        })
    })
    describe('root_uri', function() {
        it('should return a string', function() {
            expect(config.root_uri).to.be.a("string");
        })
    })
    describe('start_date', function() {
        it('should return a string', function() {
            expect(config.start_date).to.be.a("string");
        })
        it('should return a date well formated', function() {
            expect(new Date(config.start_date).getFullYear()).to.equal(2019);
        })
    })
    describe('session_max_duration_in_seconds', function() {
        it('should return a number', function() {
            expect(config.session_max_duration_in_seconds).to.be.a("number");
        })
    })
    describe('database', function() {
        it('should return an object', function() {
            expect(config.database).to.be.a("object");
            expect(config.database.port).to.be.a("number");
            expect(config.database.host).to.be.a("string");
            expect(config.database.db).to.be.a("string");
            expect(config.database.user).to.be.a("string");
            expect(config.database.pwd).to.be.a("string");
            expect(config.database.options).to.be.a("object");
        })
    })
    describe('jwt', function() {
        it('should return an object', function() {
            expect(config.jwt).to.be.a("object");
            expect(config.jwt.private).to.be.a("string");
            expect(config.jwt.public).to.be.a("string");
            expect(config.jwt.options).to.be.a("object");
            expect(config.jwt.options.issuer).to.be.a("string");
            expect(config.jwt.options.subject).to.be.a("string");
            expect(config.jwt.options.audience).to.be.a("string");
            expect(config.jwt.options.expiresIn).to.be.a("string");
            expect(config.jwt.options.algorithm).to.be.a("string");

            expect(config.jwt.verify_options).to.be.a("object");
            expect(config.jwt.verify_options.issuer).to.be.a("string");
            expect(config.jwt.verify_options.subject).to.be.a("string");
            expect(config.jwt.verify_options.audience).to.be.a("string");
            expect(config.jwt.verify_options.expiresIn).to.be.a("string");
            expect(config.jwt.verify_options.algorithms).to.be.a("Array");
        })
    })

});