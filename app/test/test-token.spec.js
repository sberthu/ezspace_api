const token_module = require("../src/modules/token");
const config = require("../src/modules/config").getConfig();
const assert = require('assert');
const expect = require('chai').expect;

describe('token', function() {
  token_module.init(config);
  describe('create', function() {
    it('should throw an exception with bad parameter', function() {
      assert.throws(_ => token_module.create(), Error, 'id_presentation must be a string');
    });
    it('should return a token', function() {
      expect(token_module.create("test")).to.be.a('string');
    });
  });

  describe('read', function() {
    it('should throw an exception with bad parameters', () => assert.throws(_ => token_module.read(), Error, 'encrypted_token must be a string'));
    it('should throw an exception with token expired', () => assert.throws(_  => token_module.read("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9wcmVzZW50YXRpb24iOiJ0ZXN0IiwiaWF0IjoxNTc2NTA5NTQyLCJleHAiOjE1NzY1MDk2MDIsImF1ZCI6InR3aWNvcnMtcHJlc2VudGVlciIsImlzcyI6Ik15bGFuIiwic3ViIjoidHdpY29ycy1wcmVzZW50YXRpb24ifQ.cBFhEqIrmOZdEKC9hAHFz-SYlc9IT-6xSvbl1upT1jcGPLMupYc3wqhE_7w11YSZnSVvMxeUZ0iyTE_kOwoXB62UM6ZqsHqzJrmpSE035dWbp5D47Ns0tGPItEdXMaCG2i4B6PfdgKbRxJUYAbqTraiBmvVYvG5ZxpfkB1ASgDRT1U-npzBAyvDzqNp5Jx7_liK0zS5iazCl2RITIZpkloZC0vxXAI7tDG4vb1VaNnhMhIsB2TZkxHJH2MgAg98Vht_MjHWrgx9WF7yiflFcwHiYxJdtG4Jx9WA9FdfvgXzfHD9MH4FhywEcmmSs51aw6g6QZr2MXRLAOuo-1UikViyFCZm3JwVqvoMe-3Vxk0oHbNe644_MEbOruHCzXmpg7nWiQDPwFOefkUllL0FXrgtFuzE0AgBsw9t3RXTxn59EAIAW7LbEy97vGU4OIZLk7_bIv-QhTSWbu5PkYOAHvEj5x0pfK34pDVVefwsu22t9Syg2vICwG5WzEeNi-xdOvWKhKX3nfUwBrwpaaE7BZe09u18DODGHu9Tr9vbyrKdFDt3rVWPseWuTlM3GzjpCtQY9oHEB7eoRkpYXtzV0zppw4z0tco28FIStCfj7NJ5xzwxvLeNWRE_M7aWhdLyCproPi2Ln01CVUrSwkDe_3-sHbqyJwStS9drm-Thoqu0"), Error, 'TokenExpiredError: jwt expired'))
  });


  describe('write and read', function() {
    let id_presentation = "test"
    let token = "";
    it('should create token', () => {
      token = token_module.create(id_presentation);
      expect(token).to.be.a('string');
    })
    it('should read token', () => {
      let uncrypted = token_module.read(token);
      console.log(JSON.stringify(uncrypted, null, 2));
      expect(uncrypted).to.have.property("id_presentation");
      expect(uncrypted.id_presentation).be.equal(id_presentation);
      expect(uncrypted).to.have.property("iat");
      expect(uncrypted.iat).to.be.a('number');
      expect(uncrypted).to.have.property("exp");
      expect(uncrypted.exp).to.be.a('number');
      expect(uncrypted).to.have.property("aud");
      expect(uncrypted.aud).to.be.a('string');
      expect(uncrypted).to.have.property("iss");
      expect(uncrypted.iss).to.be.a('string');
      expect(uncrypted).to.have.property("sub");
      expect(uncrypted.sub).to.be.a('string');
    });
  });
  
});


