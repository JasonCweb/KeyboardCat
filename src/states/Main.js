import throttle from 'lodash.throttle';
import Player from '../objects/Player';
import {WIDTH, HEIGHT} from '../constants';
window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

    // game.input.mouse.enabled = true;
    // game.input.enabled = true;
/**
 * Setup and display the main game state.
 */  /**
   * Resize the game to fit the window.
   */
  // resize() {
  //   const width = window.innerWidth * window.devicePixelRatio;
  //   const height = window.innerHeight * window.devicePixelRatio;

  //   this.scale.setGameSize(width, height);
  // }
let cat, game, lastNotesX, noteXvariance = 150, verticalBounds = 1500, prevNote, note, boopCount = 0, fallingY, showBodies = true,
  playerCollisionGroup, noteCollisionGroup, noteScale = 0.7, noteCount = 0, bonus = 10, localStorage = {}, fontColor, makeFlat = 10,
  flatCollisionGroup, flat, music, boopSound, flatSound, music2, catScale = 1;

export default class Main extends Phaser.State {
  addNote (y) {
    if (note) prevNote = note;
   //If no y position is supplied, render it just outside of the screen
    if(typeof(y) == "undefined") y = prevNote.y - 100;
    do {
      if (this.rng.integerInRange(0,1))
        lastNotesX += this.rng.integerInRange(50, noteXvariance * (3 + noteScale));
      else
        lastNotesX += this.rng.integerInRange(-50, -noteXvariance * (3 + noteScale));
    } while (lastNotesX < 50 || lastNotesX > WIDTH - 100);

    //Reset it to the specified coordinates
    note = this.groups.notes.getFirstDead();

    if (!note) {
      note = this.groups.notes.add(new Player({
        game: game,
        x: lastNotesX,
        y: y,
        key: 'note',
        frame: 'note',
        })
      );
    }
    else note.reset(lastNotesX, y);
    if (boopCount && noteCount > makeFlat){
      if(makeFlat < 40) makeFlat *= 3;
      else makeFlat += 60;
      const flat = new Player({
        game: game,
        x: 10,
        y: y,
        key: 'flat',
        frame: 'flat'
      });
      flat.tint = Math.random() * 0xffffff;
      flat.scale.x = 0.5;
      flat.scale.y = 0.5;
      game.physics.p2.enable(flat);

      flat.body.clearShapes();
      flat.body.loadPolygon('physics', 'flat', 0.5);
      flat.body.fixedRotation = true;
      flat.body.motionState = 2;
      flat.body.setCollisionGroup(flatCollisionGroup);
      flat.body.collides([flatCollisionGroup, playerCollisionGroup])
      flat.body.velocity.x = 80;
    }


    if (noteCount++ > 70) {noteScale = 0.20;
      catScale = 0.6;
      cat.scale.x = catScale;
      cat.scale.y = catScale;
      cat.body.loadPolygon('physics', '11', catScale);
    }
    else if (noteCount > 55) noteScale = 0.35;
    else if (noteCount > 40) noteScale = 0.45;
    else if (noteCount > 25) {
      noteScale = 0.55;
      cat.scale.x = catScale;
      cat.scale.y = catScale;
      catScale = 0.8;
      cat.body.loadPolygon('physics', '11', catScale);
    }
    else if (noteCount > 10) noteScale = 0.7;
    // if(prevNote && prevNote.y < -650) game.paused = true;
    // note.body.velocity.y = 29;
    if (!boopCount) note.body.velocity.y = 29;
    note.tint = Math.random() * 0xffffff;
    note.scale.x = noteScale;
    note.scale.y = noteScale;
    note.body.clearShapes();
    note.body.loadPolygon('physics', 'note', noteScale);
    note.body.motionState = 2;
    note.body.setCollisionGroup(noteCollisionGroup);
    note.body.collides([noteCollisionGroup, playerCollisionGroup]);
  }
  killFallenNotes(note) {
    if (boopCount){
      note.body.velocity.y = 0;
    }
    else if(note.y > -220){
      game.add.tween(note).to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0);
    }
    if (note.y - game.camera.y > 750) {
      note.destroy();
    }
  }

  init_hud () {
    "use strict";
    let score_position, score_style, score;
    // create score prefab
    score_position = new Phaser.Point(9, -400);
    score_style = {font: "18px Arial", fill: `#FFF`};
    score = new KeyboardCat.Score(this, "score", score_position, {text: "Score: ", style: score_style, group: "hud"});
  }

  jump() {
    verticalBounds += 500;
    game.world.setBounds(0, -verticalBounds, WIDTH, verticalBounds);
    this.bg.position.y = cat.y - 1000;
    // cat.body.velocity.y = -515;
    cat.body.moveUp(535);
  }
  boop() {
    boopSound.play();
    let boopedNote =  arguments[1];
    this.score += bonus;
    bonus += 10;
    const style = {
      font: "18px Arial",
      fill: "#FFF",
      fontVariant: "small-caps"
    };
    let text = game.add.text(boopedNote.sprite.x, boopedNote.sprite.y - 30, bonus, style);
    game.add.tween(text).to( { alpha: 0 }, 1400, Phaser.Easing.Linear.None, true, 0, 0);
    game.add.tween(boopedNote.sprite).to( { alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, 0);
    game.input.onDown.remove(this.clicked, this);
    boopedNote.sprite.body.clearCollision();
    boopCount++;
    // this.game.time.events.stop()
    this.jumpAnim.stop();
    this.jumpAnim.play('jump', 45);
    this.catVelocityFactor = 4;
    this.jump();
  }
  double() {
    flatSound.play();
    let boopedFlat =  arguments[1];
    this.score *= 2;
    const style = {
      font: "20px Arial",
      fill: "#FFF",
      fontStyle: "italic",
      fontVariant: "small-caps"
    };
    let text = game.add.text(boopedFlat.sprite.x, boopedFlat.sprite.y - 150, 'Double Score', style);
    game.add.tween(text).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 0);
    game.add.tween(boopedFlat.sprite).to( { alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, 0);
    game.input.onDown.remove(this.clicked, this);
    boopedFlat.sprite.body.clearCollision();
    boopCount++;
    this.jumpAnim.play('jump', 15);
    this.catVelocityFactor = 4;
    this.jump();
  }
  clicked() {
    this.game.time.events.stop();
    this.jumpAnim.play('jump', 15);
    this.catVelocityFactor = 4;
    game.input.onDown.halt();
    this.jump();
  }
  game_over () {
    "use strict";

    // if current score is higher than highest score, update it
    if (!localStorage.highest_score || this.score > localStorage.highest_score) {
        localStorage.highest_score = this.score;
    }

    // create a bitmap do show the game over panel
    const game_over_position = new Phaser.Point(0, this.game.world.height);
    const game_over_bitmap = this.add.bitmapData(this.game.world.width, this.game.world.height);
    game_over_bitmap.ctx.fillStyle = "#000";
    game_over_bitmap.ctx.fillRect(0, 0, this.game.world.width, this.game.world.height);
    const panel_text_style = {game_over: {font: "32px Arial", fill: "#FFF"},
                       current_score: {font: "20px Arial", fill: "#FFF"},
                       highest_score: {font: "18px Arial", fill: "#FFF"}};
    game.paused = true;
    // // create the game over panel
    // const game_over_panel = new KeyboardCat.GameOverPanel(this, "game_over_panel", game_over_position, {texture: game_over_bitmap, group: "hud", text_style: panel_text_style, animation_time: 500});
    // this.groups.hud.add(game_over_panel);
}

  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {
    game = this.game;
    game.world.setBounds(0, -HEIGHT, WIDTH, HEIGHT);
    // Enable arcade physics.
    // game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.startSystem(Phaser.Physics.P2JS);
    //  Turn on impact events for the world, without this we get no collision callbacks
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 0.8;
    noteCollisionGroup = this.physics.p2.createCollisionGroup();
    playerCollisionGroup = this.physics.p2.createCollisionGroup();
    flatCollisionGroup = this.physics.p2.createCollisionGroup();
    this.score = 0;


    music = new Howl({
      src: ['./src/assets/audio/waters.mp3'],
      volume: 1,
      onend: function() {
        music2.play();
      }
    });
    music2 = new Howl({
      src: ['./src/assets/audio/dreams.mp3'],
      volume: 1,
      onend: function() {
        music.play();
      }
    });
    boopSound = new Howl({
      src: ['./src/assets/audio/C7.mp3'],
      volume: 0.5
    });
    flatSound = new Howl({
      src: ['./src/assets/audio/Arpeggio.mp3'],
      volume: 2
    });
    music.play();
    // Collision with sprite graphics
    // this.shapeGr = game.add.graphics();
    // Add background tile.
    this.bg = game.add.tileSprite(0, -verticalBounds, 750, verticalBounds + 500, 'bg');
    // Add a player to the game.
    this.player = new Player({
      game: game,
      x: game.world.centerX,
      y: -HEIGHT/4,
      key: 'cat',
      frame: 'idle',
    });
    cat = this.player;

    // let gfx = game.add.graphics(0, 0);
    // gfx.lineStyle(5, 'blue', 1)
    // gfx.moveTo(0, 0);
    // gfx.lineTo(WIDTH, 0)
    // this.groups.notes = new Phaser.Group(game, game.world, 'fallingNotes', false, true, 1);
    this.groups = {};
    this.groups.hud = game.add.group();

    this.groups.notes = game.add.group();
    this.groups.notes.enableBody = true;
    this.groups.notes.physicsBodyType = Phaser.Physics.P2JS;
    const STARTING_NOTES = 3;
    this.rng = new Phaser.RandomDataGenerator([Math.random()]);
    const STARTING_X = this.rng.integerInRange(150, WIDTH - 150);

    for (let i = 0; i < STARTING_NOTES; i += 1) {
      lastNotesX = this.rng.integerInRange(-150, 150) + STARTING_X;
      fallingY = game.world.centerY - 50 - ( i * 122)
      let tempNote = this.groups.notes.add(new Player({
        game: game,
        x: lastNotesX,
        y: fallingY,
        key: 'note',
        frame: 'note',
      }));
      noteCount++;
      tempNote.scale.x = noteScale;
      tempNote.scale.y = noteScale;
      tempNote.tint = Math.random() * 0xffffff;

      tempNote.body.velocity.y = 29;
      tempNote.body.clearShapes();
      tempNote.body.loadPolygon('physics', 'note', noteScale);
      tempNote.body.motionState = 2;
      tempNote.body.setCollisionGroup(noteCollisionGroup);
      tempNote.body.collides([noteCollisionGroup, playerCollisionGroup]);
    }

    cat.scale.x = catScale;
    cat.scale.y = catScale;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.physics.p2.enable(cat);
    game.physics.p2.gravity.y = 600;
    cat.body.clearShapes();
    cat.body.loadPolygon('physics', '11');
    cat.tint = this.rng.realInRange(0.7,1) * 0xffffff;
    cat.body.fixedRotation = true;
    cat.body.setCollisionGroup(playerCollisionGroup);
    cat.body.collides(noteCollisionGroup, this.boop, this)
    cat.body.collides(flatCollisionGroup, this.double, this)
    cat.body.adjustCenterOfMass();

    // cat.body.kinematic = true;
    // game.physics.enable(this.note);

    // this.groups.notes.createMultiple(250, 'note');
    this.init_hud();
    // this.groups.notes.addAll('body.collideWorldBounds', true);
    this.catVelocityFactor = 1.5;
    // cat.enableBody = true; // cat.body.gravity.y = 200;
    // cat.body.collideWorldBounds = true;
    cat.anchor.setTo(0.5, 0.5);
    // cat.body.addRectangle(53, 24);
    this.jumpAnim = cat.animations.add('jump', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 15, false, true);
    game.camera.follow(cat);
    this.addNote(fallingY - 100);
    prevNote = note;
    game.physics.p2.updateBoundsCollisionGroup();
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {
    //move right
    if (game.input.x > cat.x){
      cat.scale.x = -1;
      cat.body.velocity.x = (game.input.x - cat.x) * this.catVelocityFactor;
    }
    else {
      cat.scale.x = 1;
      cat.body.velocity.x = -this.catVelocityFactor * (cat.x - game.input.x);
    }
    // Create new notes as needed before needing to draw as you scroll up
    if (game.camera.y - prevNote.y < 300) this.addNote();

    this.groups.notes.forEachAlive(this.killFallenNotes, this);

    if (cat.y - 1000 > this.bg.position.y) this.bg.position.y = cat.y - 1000;
    if (boopCount === 0) {
      game.input.onDown.add(this.clicked, this);
    }
    // this.game_over();
    // if (boopCount && cat.x > -10)
    //   this.game_over();

    // sprite.body.velocity.setTo(350, 350);
    // this.game.world.wrap(cat.body, -(HEIGHT/2), false, false, true);
  }
  render() {
    // game.debug.cameraInfo(this.game.camera, 32, 32);
    // game.debug.spriteCoords(this.player, 32, 100);
  // this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
  }
}

var KeyboardCat = KeyboardCat || {};

KeyboardCat.Score = function (game_state, name, position, properties) {
    "use strict";

    let text = Phaser.Text.call(this, game_state.game, position.x, position.y, properties.text, properties.style);


    this.name = name;
    this.game_state = game_state;
    game_state.groups[properties.group].add(this);

};

KeyboardCat.Score.prototype = Object.create(Phaser.Text.prototype);
KeyboardCat.Score.prototype.constructor = KeyboardCat.Score;

KeyboardCat.Score.prototype.update = function () {
    "use strict";
    // update the text to show the score
    this.fixedToCamera = true;
    this.cameraOffset.setTo(0, 0);
    this.setShadow(2,2, '#f9c750', 3);
    this.text = "Score: " + this.game_state.score;
};

KeyboardCat.GameOverPanel = function (game_state, name, position, properties) {
    "use strict";
    var movement_animation;
    // KeyboardCat.Prefab.call(this, game_state, name, position, properties);

    this.text_style = properties.text_style;

    this.alpha = 0.5;
    // create a tween animation to show the game over panel
    movement_animation = game_state.game.add.tween(this);
    movement_animation.to({y: -400}, properties.animation_time);
    movement_animation.onComplete.add(this.show_game_over, this);
    movement_animation.start();
};

// KeyboardCat.GameOverPanel.prototype = Object.create(KeyboardCat.Prefab.prototype);
KeyboardCat.GameOverPanel.prototype.constructor = KeyboardCat.GameOverPanel;

KeyboardCat.GameOverPanel.prototype.show_game_over = function () {
    "use strict";
    var game_over_text, current_score_text, highest_score_text;
    // add game over text
    game_over_text = game_state.game.add.text(game_state.game.world.width / 2, game_state.game.world.height * 0.4, "Game Over", this.text_style.game_over);
    game_over_text.anchor.setTo(0.5);
    game_state.groups.hud.add(game_over_text);

    // add current score text
    current_score_text = game_state.game.add.text(game_state.game.world.width / 2, game_state.game.world.height * 0.5, "Score: " + game_state.score, this.text_style.current_score);
    current_score_text.anchor.setTo(0.5);
    game_state.groups.hud.add(current_score_text);

    // add highest score text
    highest_score_text = game_state.game.add.text(game_state.game.world.width / 2, game_state.game.world.height * 0.6, "Highest score: " + localStorage.highest_score, this.text_style.highest_score);
    highest_score_text.anchor.setTo(0.5);
    game_state.groups.hud.add(highest_score_text);

    // add event to restart level
    this.inputEnabled = true;
    this.events.onInputDown.add(game_state.restart_level, game_state);
};
