var GUID = require('shortid');

function createRequest(label, parameters) {
	return createPacket(true, true, 'request', 'text', label, parameters);
}

function createResponse(label, parameters) {
	return createPacket(true, true, 'response', 'text', label, parameters);
}

function createBroadcast(label, parameters) {
	return createPacket(true, true, 'broadcast', 'text', label, parameters);
}

function createHtmlResponse(label, parameters) {
	return createPacket(true, true, 'response', 'html', label, parameters);
}

function createHtmlBroadcast(label, parameters) {
	return createPacket(true, true, 'broadcast', 'html', label, parameters);
}

function createPacket(unique, timestamp, type, format, label, parameters) {

	var newPacket = {}

	newPacket.__id = unique 
		? newPacket.__id = GUID.generate() 
		: null;

	newPacket.timestamp = timestamp 
		? ( new Date() ).valueOf() 
		: null;

	if(!type) 
		throw new Error('Uncaught Icp Error: type is not defined');
	else
		newPacket.type = type;

	newPacket.format = format || 'text';
	newPacket.label = label || null;
	newPacket.parameters = parameters || null;

	return newPacket;

}

module.exports = {

	createRequest:			createRequest,
	createResponse:			createResponse,
	createBroadcast:		createBroadcast,
	createHtmlResponse:		createHtmlResponse,
	createHtmlBroadcast:	createHtmlBroadcast,
	createPacket: 			createPacket
	
}