'use strict'

class Formation {

  constructor( id, waypoint, members, offsetAlgorithm ) {
      this._members = {};
      this._id = id;
      this._waypoint = waypoint;
      this.members = members;
      this._offsets = offsetAlgorithm( members.length );
      this._offsetAlgorithm = offsetAlgorithm;
      this._hasSpawned = false;
      this._onPlayer = false;
  }

  get payload() {
    return {
      formationId:this.id,
      members:this.members,
      listOfOffsets:this.offsets,
      waypoint:this.waypoint
    };
  }

  get id() {
    return this._id;
  }

  get memberIds() {
    let ids = [];
    for( let member of this._members ) {
      ids.push( member.npcId );
    }
    return ids;
  }

  get waypoint() {
    return this._waypoint;
  }

  get members() {
    let retMembers = [];
    for( let key in this._members ) {
      if( this._members[ key ] ) {
        retMembers.push( this._members[ key ] );
      }
    }
    return retMembers;
  }

  get offsets() {
    this._offsets = this._offsetAlgorithm( this.members.length );
    return this._offsets;
  }

  get size() {
    return this.members.length;
  }

  get hasSpawned() {
    return this._hasSpawned;
  }

  get onPlayer() {
    return this._onPlayer;
  }

  set hasSpawned( bool ) {
    this._hasSpawned = bool;
  }

  set members( members ) {
    for( let member of members ) {
      member.formationId = this.id;
      this._members[ member.npcId ] = member;
    }
  }

  set offsetsAlgorithm( oA ) {
    this._offsetAlgorithm = oA;
    this._offsets = offsetAlgorithm( this.members.length );
  }

  set waypoint( wp ) {
    // make a copy of the waypoint
    this._waypoint = Object.assign({}, wp);
  }

  set onPlayer( bool ) {
    this._onPlayer = bool;
  }

  stage() {
    this._waypoint.y = 50;
  }

  addMembers( members ) {
    for( let member of members ) {
      this._members[ member.npcId ] = member;
    }
  }

  removeMembers( numToRemove ) {
    let members = this.members.slice( 0, -numToRemove );
    let removed = this.members.slice( -numToRemove );
    this._members = members;
    return removed;
  }

  removeMember( memberId ) {
    for( let key in this._members ) {
      let member = this._members[ key ];
      if( member.npcId === memberId ){
        delete this._members[ key ];
        return true;
      }
    }
    return false;
  }

  empty() {
    this._members = {};
  }

}

module.exports = Formation;