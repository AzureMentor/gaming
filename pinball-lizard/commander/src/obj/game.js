'use strict'

class Game {

  constructor( instance ) {
    this._instance = instance;
    this._formations = {};
    this._formationsWaiting = [];
    this._timeToNextAttack = this._calculateAttackTime( Date.now(), 5000, 15000 );
    this._isFieldScattered = false;
    this._formationsLocked = false;
    this._scatterReleaseTime = 0;
    this._formationSwitchTime = 1000;
    this._atomicIceLiceTime = 0;
    this._onPlayerFlip = false;
    this._startTime = Date.now();
    this._playerWaypoint = {};
  }

  get instance() {
    return this._instance;
  }

  get timeToNextAttack() {
    return this._timeToNextAttack;
  }

  get formations() {
    let retFormations = [];
    for( let key in this._formations ) {
      if( this._formations[ key ] ) {
        retFormations.push( this._formations[ key ] );
      }
    }
    retFormations.sort( (a, b) => {
      return a.size - b.size;
    });
    return retFormations;
  }

  get attackAvailable() {
    return this._timeToNextAttack !== false &&
           Date.now() > this._timeToNextAttack;
  }

  get fieldScattered() {
    return this._isFieldScattered;
  }

  get scatterReleaseAvailable() {
    return this._isFieldScattered && Date.now() > this._scatterReleaseTime;
  }

  get atomicIceLiceAvailable() {
    return Date.now() > this._atomicIceLiceTime;
  }

  get formationsWaiting() {
    return this._formationsWaiting;
  }

  get playerWaypoint() {
    return this._playerWaypoint;
  }

  get onPlayerFlip() {
    let flip = this._onPlayerFlip;
    this._onPlayerFlip = !this._onPlayerFlip;
    return flip;
  }

  get startTime() {
    return this._startTime;
  }

  get clockTime() {
    return Date.now() - this._startTime;
  }

  set fieldScattered( isScattered ) {
    this._isFieldScattered = isScattered;
  }

  set formations( f ) {
    this._formations = {};
    for( let formation of f ) {
      this.addFormation( formation );
    }
  }

  set formationsWaiting( f ) {
    this._formationsWaiting = Array.from( f );
  }

  set playerWaypoint( wp ) {
    this._playerWaypoint = Object.assign({}, wp);
  }

  setFormationSwitchTime( delay ) {
    this._formationSwitchTime = Date.now() + delay;
  }

  setScatterReleaseTime( waitTime ) {
    this._scatterReleaseTime = Date.now() + waitTime;
  }

  setAtomicIceLiceTime( waitTime ) {
    this._atomicIceLiceTime = Date.now() + waitTime;
  }

  setFormationLock() {
    this._formationsLocked = true;
  }

  releaseFormationLock() {
    this._formationsLocked = false;
  }

  updateAttackTime( min, max, expire ) {
    let attackTime = this._calculateAttackTime( Date.now(), min, max );
    let expires = this.startTime + expire;
    this._timeToNextAttack = attackTime > expires ? false : attackTime;
  }

  getFormationById( id ) {
    return this._formations[ id ];
  }

  removeFormation( formation ) {
    let set = this.formations;
    for( let i = 0; i < set.length; i++ ) {
      let current = set[ i ];
      if( current.id === formation.id ) {
        delete this._formations[ current.id ];
      }
    }
  }

  addFormation( formation ) {
    this._formations[ formation.id ] = formation;
  }

  formationSwitchAvailable( processTime ) {
    let available = Date.now() > this._formationSwitchTime;
    let attackDelta = this._timeToNextAttack - Date.now();
    // also check for attack closing in as moves will be delayed
    // and will affect scatter. This timeout shouldn't be changed.
    let timing = this._timeToNextAttack === false || attackDelta > ( processTime > 1.5 );
    return available && timing;
  }

  _calculateAttackTime( from, min, max ) {
    const rand = Math.random();
    const range = max - min;
    return from + ( min + ( range * rand ) );
  }

}

exports = module.exports = Game;