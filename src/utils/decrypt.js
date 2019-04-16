const CryptoJS = require("crypto-js");


export function decrypt(keyHex, base64EncodedData) {
	const key = CryptoJS.enc.Hex.parse(keyHex);
	// parse base64 encoded data
	const data = CryptoJS.enc.Base64.parse(base64EncodedData);
	// take first 16 bytes for get initializing vector
	const iv = CryptoJS.lib.WordArray
		.create([data.words[0],data.words[1],data.words[2],data.words[3]],16);
	const encryptedData = CryptoJS.lib.WordArray
		.create(data.words.slice(4), data.sigBytes - 16);
	const cipherParams = CryptoJS.lib.CipherParams.create({
		ciphertext: encryptedData
	});
	const decrypted = CryptoJS.AES.decrypt(
		cipherParams,
		key,
		{ iv });
	return decrypted.toString(CryptoJS.enc.Utf8);
}
