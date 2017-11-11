'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GoogleAccess = function () {
  function GoogleAccess(name, clientId, clientSecret, refreshToken) {
    _classCallCheck(this, GoogleAccess);

    this.name = name;
    this.accessTokenKey = name + '.AccessToken';
    this.accessTokenExpiresAtKey = name + '.AccessTokenExpiresAt';
    this.urlPrefix = 'https://www.googleapis.com';
    this.authData = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    };
  }

  _createClass(GoogleAccess, [{
    key: 'init',
    value: function init() {
      return this._resolveAccessToken();
    }
  }, {
    key: 'eventsOf',
    value: function eventsOf(calendar, query) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._resolveAccessToken().then(function () {
          _this._getJson('/calendar/v3/calendars/' + calendar + '/events', query).then(resolve);
        }).catch(reject);
      });
    }
  }, {
    key: 'files',
    value: function files(query) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2._resolveAccessToken().then(function () {
          _this2._getJson('/drive/v3/files', query).then(resolve);
        }).catch(reject);
      });
    }
  }, {
    key: '_resolveAccessToken',
    value: function _resolveAccessToken() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var nowMillis = new Date().getTime();
        if (!_this3.accessTokenExpiresAt) {
          _this3.accessToken = sessionStorage.getItem(_this3.accessTokenKey) || '';
          _this3.accessTokenExpiresAt = sessionStorage.getItem(_this3.accessTokenExpiresAtKey) || nowMillis - 1;
        }
        if (_this3.accessTokenExpiresAt < nowMillis) {
          _this3._postJson('/oauth2/v4/token', _this3.authData).then(function (auth) {
            _this3.accessToken = auth.access_token;
            _this3.accessTokenExpiresAt = nowMillis + auth.expires_in * 1000;
            sessionStorage.setItem(_this3.accessTokenKey, _this3.accessToken);
            sessionStorage.setItem(_this3.accessTokenExpiresAtKey, _this3.accessTokenExpiresAt);
            console.debug('access token refreshed for \'' + _this3.name + '\'');
            resolve(_this3.accessToken);
          }).catch(reject);
        } else {
          resolve(_this3.accessToken);
        }
      });
    }
  }, {
    key: '_postJson',
    value: function _postJson(path, data) {
      return this._ajax('POST', '' + this.urlPrefix + path, { 'Content-Type': 'application/x-www-form-urlencoded' }, data);
    }
  }, {
    key: '_getJson',
    value: function _getJson(path, query) {
      return this._ajax('GET', '' + this.urlPrefix + path, { 'Authorization': 'Bearer ' + this.accessToken }, query);
    }
  }, {
    key: '_ajax',
    value: function _ajax(method, url, headers, data) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        if (data) {
          data = Object.keys(data).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
          }).join('&');
        }
        if (method === 'GET') {
          url += '?' + data;
        }
        xhr.open(method, url, true);
        Object.keys(headers).forEach(function (key) {
          return xhr.setRequestHeader(key, headers[key]);
        });
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 400) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(xhr.responseText);
          }
        };
        xhr.onerror = function () {
          reject(xhr.responseText);
        };
        if (method === 'POST') {
          xhr.send(data);
        } else {
          xhr.send();
        }
      });
    }
  }]);

  return GoogleAccess;
}();