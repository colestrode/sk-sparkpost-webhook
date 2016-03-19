'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

describe('Webhoooooks', function() {
  let requestMock;
  let controllerMock;
  let botMock;
  let plugin;

  beforeEach(function() {
    requestMock = sinon.stub();

    botMock = {
      reply: sinon.stub(),
      api: {
        files: {
          upload: sinon.stub().yields(null)
        }
      }
    };

    controllerMock = {
      hears: sinon.stub(),
      log: sinon.stub()
    };

    plugin = proxyquire('../index', {request: requestMock});
  });

  it('should register listener', function() {
    plugin.init(controllerMock);
    expect(controllerMock.hears).to.have.been.calledOnce;
  });

  it('should register help', function() {
    expect(plugin.help.command).to.equal('webhooks');
    expect(plugin.help.text).to.be.a('function');
    expect(plugin.help.text({botName: 'arnold'})).to.match(/webhooks sample events/);
  });

  describe('Listener', function() {
    let messageMock;
    let response;
    let error;
    let callback;

    beforeEach(function() {
      messageMock = {
        channel: 'amc',
        match: [null, null, null, null, null]
      };

      response = {body: '{}'};
      requestMock.yields(null, [response]);

      error = new Error('IAMTHEONEWHOKNOCKS');

      plugin.init(controllerMock);

      callback = controllerMock.hears.args[0][2];
    });

    it('should request all samples', function() {
      return callback(botMock, messageMock).then(function() {
        expect(requestMock).to.have.been.calledWith({
          method: 'GET',
          uri: 'https://api.sparkpost.com/api/v1/webhooks/events/samples'
        });

        expect(botMock.api.files.upload).to.be.calledWith({
          filetype: 'javascript',
          title: 'Webhooks Sample Events',
          filename: 'Webhooks Sample Events',
          content: '{}',
          channels: messageMock.channel
        });
      });
    });

    it('should request samples for events', function() {
      messageMock.match[4] = 'click, open';

      return callback(botMock, messageMock).then(function() {
        expect(requestMock).to.have.been.calledWith({
          method: 'GET',
          uri: 'https://api.sparkpost.com/api/v1/webhooks/events/samples',
          qs: {events: 'click,open'} // trims whitespace between events
        });

        expect(botMock.api.files.upload).to.be.calledWith({
          filetype: 'javascript',
          title: 'Webhooks Sample Events: click, open',
          filename: 'Webhooks Sample Events: click, open',
          content: '{}',
          channels: messageMock.channel
        });
      });
    });

    it('should handle error in making request', function() {
      requestMock.yields(error);

      return callback(botMock, messageMock).then(function() {
        expect(botMock.api.files.upload).not.to.have.been.called;
        expect(controllerMock.log).to.have.been.calledWith(error);
        expect(botMock.reply).to.have.been.calledWithMatch(messageMock, /^Oops!/);
      });
    });

    it('should handle error uploading results', function() {
      botMock.api.files.upload.yields(error);

      return callback(botMock, messageMock).then(function() {
        expect(requestMock).to.have.been.called;
        expect(controllerMock.log).to.have.been.calledWith(error);
        expect(botMock.reply).to.have.been.calledWithMatch(messageMock, /^Oops!/);
      });
    });
  });
});
