"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.decrypt = decrypt;
var CryptoJS = require("crypto-js");

function decrypt(keyHex, base64EncodedData) {
	var key = CryptoJS.enc.Hex.parse(keyHex);
	console.log("base64encoded", base64EncodedData);
	// parse base64 encoded data
	var data = CryptoJS.enc.Base64.parse(base64EncodedData);
	console.log("data", data);
	// take first 16 bytes for get initializing vector
	var iv = CryptoJS.lib.WordArray.create([data.words[0], data.words[1], data.words[2], data.words[3]], 16);
	var encryptedData = CryptoJS.lib.WordArray.create(data.words.slice(4), data.sigBytes - 16);
	var cipherParams = CryptoJS.lib.CipherParams.create({
		ciphertext: encryptedData
	});
	var decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });
	return decrypted.toString(CryptoJS.enc.Utf8);
}