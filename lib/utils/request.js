"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _core = require("./core");

var _path = require("./path");

var _path2 = _interopRequireDefault(_path);

var _decrypt = require("./decrypt");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function request(url, type, withCredentials, headers) {
	var supportsURL = typeof window != "undefined" ? window.URL : false; // TODO: fallback for url if window isn't defined
	var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

	var deferred = new _core.defer();

	var xhr = new XMLHttpRequest();

	//-- Check from PDF.js:
	//   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
	var xhrPrototype = XMLHttpRequest.prototype;

	var header;

	if (!("overrideMimeType" in xhrPrototype)) {
		// IE10 might have response, but not overrideMimeType
		Object.defineProperty(xhrPrototype, "overrideMimeType", {
			value: function xmlHttpRequestOverrideMimeType() {}
		});
	}

	if (withCredentials) {
		xhr.withCredentials = true;
	}

	xhr.onreadystatechange = handler;
	xhr.onerror = err;

	xhr.open("GET", url, true);

	for (header in headers) {
		xhr.setRequestHeader(header, headers[header]);
	}

	if (type == "json") {
		xhr.setRequestHeader("Accept", "application/json");
	}

	// If type isn"t set, determine it from the file extension
	if (!type) {
		type = new _path2.default(url).extension;
	}

	if (type == "blob") {
		xhr.responseType = BLOB_RESPONSE;
	}

	if ((0, _core.isXml)(type)) {
		// xhr.responseType = "document";
		xhr.overrideMimeType("text/xml"); // for OPF parsing
	}

	if (type == "xhtml") {
		// xhr.responseType = "document";
	}

	if (type == "html" || type == "htm") {
		// xhr.responseType = "document";
	}

	if (type == "binary") {
		xhr.responseType = "arraybuffer";
	}

	xhr.send();

	function err(e) {
		deferred.reject(e);
	}

	function handler() {
		var _this = this;

		var getResponseData = function getResponseData(_resp) {
			var response = _resp ? _resp : _this.response;
			if (_this.responseType == "arraybuffer") return response;

			var settings = window.sharedSettings;
			if (settings && settings.decryptionKey) {
				return (0, _decrypt.decrypt)(window.sharedSettings.decryptionKey, response);
			}
			return response;
		};

		if (this.readyState === XMLHttpRequest.DONE) {
			var responseXML = false;

			if (this.responseType === "" || this.responseType === "document") {
				responseXML = this.responseXML;
			}

			if (this.status === 200 || this.status === 0 || responseXML) {
				//-- Firefox is reporting 0 for blob urls
				var r;

				if (!this.response && !responseXML) {
					deferred.reject({
						status: this.status,
						message: "Empty Response",
						stack: new Error().stack
					});
					return deferred.promise;
				}

				if (this.status === 403) {
					deferred.reject({
						status: this.status,
						response: this.response,
						message: "Forbidden",
						stack: new Error().stack
					});
					return deferred.promise;
				}

				if (responseXML) {
					r = getResponseData(this.responseXML);
				} else if ((0, _core.isXml)(type)) {
					// xhr.overrideMimeType("text/xml"); // for OPF parsing
					// If this.responseXML wasn't set, try to parse using a DOMParser from text
					r = (0, _core.parse)(getResponseData(), "text/xml");
				} else if (type == "xhtml") {
					r = (0, _core.parse)(getResponseData(), "application/xhtml+xml");
				} else if (type == "html" || type == "htm") {
					r = (0, _core.parse)(getResponseData(), "text/html");
				} else if (type == "json") {
					r = JSON.parse(getResponseData());
				} else if (type == "blob") {
					if (supportsURL) {
						r = getResponseData();
					} else {
						//-- Safari doesn't support responseType blob, so create a blob from arraybuffer
						r = new Blob([getResponseData()]);
					}
				} else {
					r = getResponseData();
				}

				deferred.resolve(r);
			} else {

				deferred.reject({
					status: this.status,
					message: this.response,
					stack: new Error().stack
				});
			}
		}
	}

	return deferred.promise;
}

exports.default = request;
module.exports = exports["default"];