'use strict'
const _ = require('lodash');
const { URL } = require('url');

// abstraction for future modification if necessary

module.exports = exports = class {

  constructor( msg ) {
    this._msg = msg;
  }

  /**
  * @return {URL} url to route
  */
  resolve( allowPrivate = false ) {
    let endpoints;
    if( allowPrivate ) {
      // require merged private/public routes
      endpoints = require('../config/route/private-routes');
    } else {
      endpoints = require('../config/route/public-routes');
    }
    let routeOpts = ['type', 'spec', 'action'];
    let route = null;
    /*
    * look through route-data until we've found
    * the routing method
    */
    for( let i = 0; i < routeOpts.length; i++ ) {
      let next = this._msg[ routeOpts[i] ];
      if( route === null ) {
        route = endpoints[ next ];
      }else if( route === undefined ){
        break;
      }else {
        route = route[ next ];
      }
      if( typeof( route ) === "function" ) {
        return this.compileRoute( route );
      }
    }
    return null;
  }

  /**
  * @param {function} f routing method
  * @return {object}
  */
  compileRoute( f ) {
    let route = f( this._msg.toJSON() );
    const url = new URL( route.ep );
    console.log( url.href );
    let headers = route.headers;
    return { url, headers }
  }

}