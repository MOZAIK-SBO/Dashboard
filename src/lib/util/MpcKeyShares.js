var crypto = window.crypto.subtle;

/**
 *
 * @param {ArrayBuffer[]} arrays
 * @returns {Uint8Array}
 */
function append(arrays) {
	const totalLength = arrays.reduce((acc, arr) => acc + arr.byteLength, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const arr of arrays) {
		result.set(new Uint8Array(arr, 0, arr.byteLength), offset);

		offset += arr.byteLength;
	}
	return result;
}

/**
 *
 * @param {Uint8Array} share
 * @param {CryptoKey} pubKey
 * @param {ArrayBuffer} pubKeyBuf
 * @param {ArrayBuffer} context
 * @returns {Promise<ArrayBuffer>}
 */
async function pkEnc(share, pubKey, pubKeyBuf, context) {
	const label = append([context, pubKeyBuf]);
	return crypto.encrypt({ name: 'RSA-OAEP', label: label }, pubKey, share);
}

/**
 *
 * @param {TextEncoder} textEncoder
 * @param {string} userId
 * @param {CryptoKey} party1Pubkey
 * @param {CryptoKey} party2Pubkey
 * @param {CryptoKey} party3Pubkey
 * @returns
 */
async function createUserIdAndPubkeyContext(
	textEncoder,
	userId,
	party1Pubkey,
	party2Pubkey,
	party3Pubkey
) {
	const userIdBuffer = textEncoder.encode(userId);
	const party1PubkeyBuffer = await crypto.exportKey('spki', party1Pubkey);
	const party2PubkeyBuffer = await crypto.exportKey('spki', party2Pubkey);
	const party3PubkeyBuffer = await crypto.exportKey('spki', party3Pubkey);
	return {
		contextBuf: append([userIdBuffer, party1PubkeyBuffer, party2PubkeyBuffer, party3PubkeyBuffer]),
		pk1Buf: party1PubkeyBuffer,
		pk2Buf: party2PubkeyBuffer,
		pk3Buf: party3PubkeyBuffer
	};
}

/**
 *
 * @param {string} str
 * @returns {ArrayBuffer}
 */
function str2ab(str) {
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}

	return buf;
}

/**
 *
 * @param {string} mpcKey the pemContent of the public key
 * @returns {Promise<CryptoKey>}
 */
export function mpcKeyToCryptoKey(mpcKey) {
	return crypto.importKey(
		'spki',
		str2ab(atob(mpcKey)),
		{
			name: 'RSA-OAEP',
			hash: 'SHA-256'
		},
		true,
		['encrypt']
	);
}

/**
 *
 * @param {string} s hex encoded byte string
 * @returns {Uint8Array}
 */
export function hexToBuffer(s) {
	const ct = new Uint8Array(s.length / 2);
	for (var i = 0; i < ct.byteLength; i++) {
		ct[i] = parseInt(s.substring(2 * i, 2 * i + 2), 16);
	}
	return ct;
}

/**
 *
 * @param {string} userId
 * @param {Uint8Array} iotDeviceKey
 * @param {string} algorithm
 * @param {CryptoKey} party1Pubkey
 * @param {CryptoKey} party2Pubkey
 * @param {CryptoKey} party3Pubkey
 * @param {string} analysisType
 * @param {number[]} dataIndices array of timestamps in millisecond precision
 * @returns {Promise<ArrayBuffer[]>}
 */
export async function createEncryptedKeyShares(
	userId,
	iotDeviceKey,
	algorithm,
	party1Pubkey,
	party2Pubkey,
	party3Pubkey,
	analysisType,
	dataIndices
) {
	// create context
	const textEncoder = new TextEncoder();
	const userIdAndPubkeyBuffer = await createUserIdAndPubkeyContext(
		textEncoder,
		userId,
		party1Pubkey,
		party2Pubkey,
		party3Pubkey
	);
	const analysisTypeBuffer = textEncoder.encode(analysisType);
	// dataIndices are 64-bit timestamps
	const dataIndicesBuffer = new ArrayBuffer(dataIndices.length * 8);
	const view = new DataView(dataIndicesBuffer);
	for (var i = 0; i < dataIndices.length; i++) {
		const int64 = dataIndices[i];
		// load the buffer in little endian order
		view.setBigUint64(8 * i, BigInt(int64), true);
	}
	const algorithmBuffer = textEncoder.encode(algorithm);
	const contextBuffer = append([
		userIdAndPubkeyBuffer['contextBuf'],
		dataIndicesBuffer,
		analysisTypeBuffer,
		algorithmBuffer
	]);

	if (algorithm == 'AES-GCM-128') {
		if (iotDeviceKey.byteLength != 16) {
			throw 'Expected key size of 128bit';
		}
		var share1 = new Uint8Array(16);
		var share2 = new Uint8Array(16);
		window.crypto.getRandomValues(share1);
		window.crypto.getRandomValues(share2);
		var share3 = new Uint8Array(16);
		for (var i = 0; i < 16; i++) {
			share3[i] = iotDeviceKey[i] ^ share1[i] ^ share2[i];
		}
		var c1 = await pkEnc(share1, party1Pubkey, userIdAndPubkeyBuffer['pk1Buf'], contextBuffer);
		var c2 = await pkEnc(share2, party2Pubkey, userIdAndPubkeyBuffer['pk2Buf'], contextBuffer);
		var c3 = await pkEnc(share3, party3Pubkey, userIdAndPubkeyBuffer['pk3Buf'], contextBuffer);
		return [c1, c2, c3];
	} else {
		throw 'Unsupported algorithm';
	}
}

/**
 *
 * @param {string} userId
 * @param {Uint8Array} iotDeviceKey
 * @param {CryptoKey} party1Pubkey
 * @param {CryptoKey} party2Pubkey
 * @param {CryptoKey} party3Pubkey
 * @param {string} computationId analysis id
 * @param {string} analysisType
 * @param {Uint8Array} encryptedResult
 * @returns {Promise<ArrayBuffer>}
 */
export async function reconstructResult(
	userId,
	iotDeviceKey,
	party1Pubkey,
	party2Pubkey,
	party3Pubkey,
	computationId,
	analysisType,
	encryptedResult
) {
	// create context
	const textEncoder = new TextEncoder();
	const userIdAndPubkeyBuffer = (
		await createUserIdAndPubkeyContext(
			textEncoder,
			userId,
			party1Pubkey,
			party2Pubkey,
			party3Pubkey
		)
	)['contextBuf'];
	const compIdBuf = textEncoder.encode(computationId);
	const analysisTypeBuf = textEncoder.encode(analysisType);
	const context = append([userIdAndPubkeyBuffer, compIdBuf, analysisTypeBuf]);

	// convert key
	const key = await crypto.importKey('raw', iotDeviceKey, { name: 'AES-GCM' }, true, ['decrypt']);

	// derive nonce from context
	const fullNonce = await crypto.digest('SHA-256', context);
	// the full nonce is too large, AES-GCM can only handle 96-bit
	const msg = await crypto.decrypt(
		{ name: 'AES-GCM', iv: fullNonce.slice(0, 12), additionalData: context, tagLength: 128 },
		key,
		encryptedResult
	);
	return msg;
}
