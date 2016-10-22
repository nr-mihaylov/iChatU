// This npm module has been slightly modified and thus pulled out of the node_modules
var _ = require('lodash');

/**
 * Adds connection listeners to the given socket.io server, so clients
 * are forced to authenticate before they can receive events.
 *
 * @param {Object} io - the socket.io server socket
 *
 * @param {Object} config - configuration values
 * @param {Function} config.authenticate - indicates if authentication was successfull
 * @param {Function} config.postAuthenticate=noop -  called after the client is authenticated
 * @param {Number} [config.timeout=1000] - amount of millisenconds to wait for a client to
 * authenticate before disconnecting it. A value of 'none' means no connection timeout.
 */
module.exports = function socketIOAuth(io, config) {
  config = config || {};
  var timeout = config.timeout || 1000;
  var postAuthenticate = config.postAuthenticate || _.noop;

  _.each(io.nsps, forbidConnections);
  io.on('connection', function(socket) {

    socket.auth = false;
    socket.on('authentication', function(data) {

      config.authenticate(socket, data, function(err, success, response) {
        if (success) {
          socket.auth = true;

          _.each(io.nsps, function(nsp) {
            restoreConnection(nsp, socket);
          });

          socket.emit('authenticated', response);
          return postAuthenticate(io, socket, data);
        } else if (err) {
          socket.emit('unauthorized', response, function() {
            socket.disconnect();
          });
        } else {
          socket.emit('unauthorized', response, function() {
            socket.disconnect();
          });
        }

      });

    });

    if (timeout !== 'none') {
      setTimeout(function() {
          // If the socket didn't authenticate after connection, disconnect it
          if (!socket.auth) {
            socket.disconnect('unauthorized');
          }
        }, timeout);
    }

  });
};

/**
 * Set a listener so connections from unauthenticated sockets are not
 * considered when emitting to the namespace. The connections will be
 * restored after authentication succeeds.
 */
function forbidConnections(nsp) {
  nsp.on('connect', function(socket) {
    if (!socket.auth) {
      delete nsp.connected[socket.id];
    }
  });
}

/**
 * If the socket attempted a connection before authentication, restore it.
 */
function restoreConnection(nsp, socket) {
  if (_.findWhere(nsp.sockets, {id: socket.id})) {
    nsp.connected[socket.id] = socket;
  }

}
