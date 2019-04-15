'use strict'

const Validator = require('jsonschema').Validator;
const dateformat = require('dateformat');
const config = require('../config');

// abstraction for future modifications

class Message {

  constructor( jsn ) {
    this.populate( jsn );
    this.validator = new Validator();
  }

  populate( jsn ) {
    this.orig = jsn;
    this.auth = jsn.auth;
    this.instance = jsn.instance;
    this.type = jsn.type;
    this.spec = jsn.spec;
    this.action = jsn.action;
    this.payload = jsn.payload;
    this[config.replyToSender] = jsn[config.replyToSender];
    this[config.replyToBoth] = jsn[config.replyToBoth];
    this[config.passthrough] = jsn[config.passthrough];
    this.when = Date.now();
  }

  isValid( schema ) {
    let res = this.validator.validate( this.orig, schema );
    if( res.errors.length > 0 ) {
      return `${res.errors[0].property} ${res.errors[0].message}`;
    }else{
      return true;
    }
  }

  toJSON(){
    return this.constructor.compile( this.instance, this.type, this.spec, this.action, this.payload );
  }

  toJSONString(){
    return JSON.stringify(
        this.constructor.compile( this.instance, this.type, this.spec, this.action, this.payload )
    );
  }

  static compile( instance, type, spec, action, payload ) {
      let now = Date.now();
      return {
        timestamp:now,
        human_time:dateformat(now),
        instance,type,spec,action,payload
      };
  }

}

exports = module.exports = Message;