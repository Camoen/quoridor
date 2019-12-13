var chai = require('chai');  
var expect = chai.expect;
var config = require('config');
var server = require('../src/index');
console.log(server.port)

describe('Server', ()=>{
    it('tests that server is running current port', async()=>{
        expect(server.port).to.equal(config.get('port'))
   
    })
});
