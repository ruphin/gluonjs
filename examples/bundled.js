var gluon_js = GluonJS;
(function (gluon_js) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['<style> p { color: firebrick } </style>'], ['<style> p { color: firebrick } </style>']);
var _templateObject2 = _taggedTemplateLiteral(['\n      ', '\n      <p>Hello ', '</p>\n    '], ['\n      ', '\n      <p>Hello ', '</p>\n    ']);
var _templateObject3 = _taggedTemplateLiteral(['<style> p { text-transform: uppercase } </style>'], ['<style> p { text-transform: uppercase } </style>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HelloMessage = function (_GluonElement) {
  _inherits(HelloMessage, _GluonElement);

  function HelloMessage() {
    _classCallCheck(this, HelloMessage);

    return _possibleConstructorReturn(this, (HelloMessage.__proto__ || Object.getPrototypeOf(HelloMessage)).apply(this, arguments));
  }

  _createClass(HelloMessage, [{
    key: 'style',
    get: function get() {
      return gluon_js.html(_templateObject);
    }
  }, {
    key: 'template',
    get: function get() {
      return gluon_js.html(_templateObject2, this.style, this.getAttribute('name'));
    }
  }]);

  return HelloMessage;
}(gluon_js.GluonElement);

var LoudMessage = function (_HelloMessage) {
  _inherits(LoudMessage, _HelloMessage);

  function LoudMessage() {
    _classCallCheck(this, LoudMessage);

    return _possibleConstructorReturn(this, (LoudMessage.__proto__ || Object.getPrototypeOf(LoudMessage)).apply(this, arguments));
  }

  _createClass(LoudMessage, [{
    key: 'style',
    get: function get() {
      return gluon_js.html(_templateObject3);
    }
  }]);

  return LoudMessage;
}(HelloMessage);

customElements.define(LoudMessage.is, LoudMessage);
customElements.define(HelloMessage.is, HelloMessage);

}(gluon_js));
