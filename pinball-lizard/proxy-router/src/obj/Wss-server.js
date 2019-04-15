'use strict'

const _ = require('lodash');
const WebSocket = require('ws');
const url = require('url');

/**
*
* @param {Object} opts server options (ws)
* @desc usage:
* let wss = new <Server>( {http} )
*           .onConnect( (ws, req, context) =>{} ) // optional
*           .onMessage( (msg, context) => { ?context.send(msg);? } ) // optional
*           .onClose( context => {} ) // optional
*           .start(); // start listening
* wss.send(msg)
*
*/

exports = module.exports = class {

  /**
  * @param {array} optList array of server object options
  * @param {int} timeout ms delay to timeout new connections before auth
  */
  constructor( optList, timeout = 5000 ) {
    this._connections = this._messages = 0;
    this.timeout = timeout;
    this.optList = optList;
    this._wss = [];
    this._sockets = [];
    this._started = false;
    this._onConnectCallbacks = [];
    this._onMessageReceivedCallbacks = [];
    this._onSocketCloseCallbacks = [];
    this._onStartCallbacks = [];
    this._locations = [];
    this._initialize( optList );
  }

  /**
  * send - send a message downstream
  * @param {msg} JSON stringified, to send
  * @param {broadcast} BOOL broadcast the message (ignore valid)
  */
  send( msg, broadcast ) {
    // message must be a string
    if( typeof(msg) != 'string' ){
      msg = JSON.stringify( msg );
    }
    // message must be something
    if( msg.length === 0 ) {
      return;
    }
    for( let client of this._sockets ) {
      if( client.readyState === WebSocket.OPEN
          && ( broadcast || this._isClientValidated( client ) ) ) {
        client.send( msg );
      }
    }
  }

  /**
  * start - start listening for connections
  * @return this
  */
  start() {
    if( !this._started ) {
      for( let wss of this._wss ) {
        wss.on( 'connection', this._handleConnection.bind( this ) );
      }
      // startup callbacks
      const cb = this._onStartCallbacks;
      for( const f of cb ) {
        f( this );
      }
    }
    return this;
  }

  /**
  * @param {WebSocket} ws
  */
  setWebSocketValidated( ws, validated ) {
    if( !validated ) this._destroyWebsocketConnection( ws );
    clearTimeout( ws.authTimeout );
    ws.isValidated = validated;
  }

  /**
  * @return {bool} is connected
  */
  get connected(){
    return this._sockets.length > 0;
  }

  /**
  * onStart - add method to onStart stack
  * @param {f} f(websocket, request, context)
  * @return this
  */
  onStart( f ) {
    this._onStartCallbacks.push( f );
    return this;
  }

  /**
  * onConnect - add method to onConnect stack
  * @param {f} f(websocket, request, context)
  * @return this
  */
  onConnect( f ) {
    this._onConnectCallbacks.push( f );
    return this;
  }

  /**
  * onMessage - add method to onMessage stack
  * @param {f} f(message, websocket, context),
               @return message - modified message for next method on stack
                       null|undefined - next method receives message
                       false - stop stack execution
  * @return this
  */
  onMessage( f ) {
    this._onMessageReceivedCallbacks.push( f );
    return this;
  }

  /**
  * onClose - add method to onClose stack
  * @param {function} f(context)
  * @return this
  */
  onClose( f ) {
    this._onSocketCloseCallbacks.push( f );
    return this;
  }

  /**
  * onError - single error method call
  * @param {function} f(context)
  * @return this
  */
  onError( f ) {
    this._onErrorCallback = f;
    return this;
  }

  /**
  * @return location
  */
  locations() {
    return this._locations;
  }

  /**
  * @return current connections
  */
  currentConnections() {
    return this.sockets.length;
  }

  /**
  * @return total connections
  */
  connections() {
    return this._connections;
  }

  /**
  * @return total messages
  */
  messages() {
    return this._messages;
  }

  _initialize( optList ) {
    for( let optSet of optList ){
      this._wss.push( new WebSocket.Server( optSet ) );
    }
  }

  _destroyWebsocketConnection( ws ) {
    let index = this._sockets.indexOf( ws );
    ws.terminate();
    this._sockets.splice( index, 1 );
  }

  _setWebSocketTimeout( ws ) {
    ws.authTimeout = setTimeout( () =>  {
      this._destroyWebsocketConnection( ws );
    }, this.timeout)
  }

  _isClientValidated( ws ) {
    return ws.isValidated;
  }

  _handleConnection( ws, req ) {
    console.log('connection')
    this._connections++;
    this._setWebSocketTimeout( ws );
    this._sockets.push( ws );
    this._locations.push( url.parse(req.url, true) );
    let cb = this._onConnectCallbacks;
    for( let f of cb ){
      f(ws, req, this);
    }
    ws.on('message', ( msg ) => {
      this._handleMessageReceived( msg, ws, this )
    });
    ws.on('close', this._handleWSClosure.bind(this));
  }

  _handleWSClosure() {
    this._currentConnections--;
    let cb = this._onSocketCloseCallbacks;
    for( let f of cb ){
      f( this );
    }
    this.ws = null;
  }

  _handleMessageReceived( msg, ws, context ) {
    context._messages++;
    let cb = context._onMessageReceivedCallbacks;
    for( let f of cb ){
      msg = f( msg, ws, context );
      if( msg === false ) {
        context._onErrorCallback( context );
        return; // stop, calling error
      }
    }
  }

}