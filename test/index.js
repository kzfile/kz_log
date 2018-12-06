const chai = require('chai');
const Mocha = require('Mocha');
const mocha = new Mocha();
const expect = chai.expect;
const fs = require('fs');

const log = require('../index');
const moment = require('moment');
mocha.run(() => {
    describe('default config test', () => {
        let root = process.cwd();
        let info_path = `${root}/log/p_0/info/${moment().format('YYYY-MM-DD')}.log`;
        if (fs.existsSync(info_path))
            fs.unlinkSync(info_path)
        let error_path = `${root}/log/p_0/error/${moment().format('YYYY-MM-DD')}.log`;
        if (fs.existsSync(error_path))
            fs.unlinkSync(error_path)
        let _log = new log();
        describe('test info', () => {
            it('will be info log in info folder', () => {
                let exit = fs.existsSync(info_path);
                expect(exit).to.eql(true);
            })

            it('will be "test_info" log in info.log', () => {
                _log.info('test_info');
                let content = fs.readFileSync(info_path).toString();
                content = content.split('\n');
                expect(content[0]).to.eql('test_info');
            })

            it('will be json log', () => {
                let json_log = {
                    info: 'test_info'
                }
                _log.info(json_log);
                let content = fs.readFileSync(info_path).toString();
                content = content.split('\n');
                expect(JSON.parse(content[1]).info).to.eql('test_info');
            })
        })

        describe('test error', () => {
            it('will be error log in error folder', () => {
                let exit = fs.existsSync(error_path);
                expect(exit).to.eql(true);
            })

            it('will be "test_error" log in error.log', () => {
                _log.error('test_error');
                let content = fs.readFileSync(error_path).toString();
                content = content.split('\n');
                expect(content[0]).to.eql('test_error');
            })

            it('will be json log', () => {
                let json_log = {
                    error: 'test_error'
                }
                _log.error(json_log);
                let content = fs.readFileSync(error_path).toString();
                content = content.split('\n');
                expect(JSON.parse(content[1]).error).to.eql('test_error');
            })
        })
    })
})