import {Howl, Howler} from 'howler';
// import Stats from 'stats.js';
import Boot from './states/Boot';
import Preload from './states/Preload';
import Main from './states/Main';
import './assets/css/index.css';
import {WIDTH, HEIGHT} from './constants';
/**
 * Setup the root class for the whole game.
 */
window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');
class Game extends Phaser.Game {
  constructor() {
    // Setup the game's stage.
    super({
      // width: window.innerWidth * window.devicePixelRatio,
      // height: window.innerHeight * window.devicePixelRatio,
      width: WIDTH,
      height: HEIGHT,
      renderer: Phaser.WEBGL_MULTI,
      antialias: true,
      multiTexture: true,
      enableDebug: process.env.NODE_ENV === 'development',
    });

    // Setup the different game states.
    this.state.add('Boot', Boot, false);
    this.state.add('Preload', Preload, false);
    this.state.add('Main', Main, false);

    // Kick things off with the boot state.
    this.state.start('Boot');

    // // Handle debug mode.
    // if (process.env.NODE_ENV === 'development') {
    //   this.setupStats();
    // }
  }
}
//   /**
//    * Display the FPS and MS using Stats.js.
//    */
//   setupStats() {
//     // Setup the new stats panel.
//     const stats = new Stats();
//     document.body.appendChild(stats.dom);

//     // Monkey-patch the update loop so we can track the timing.
//     const updateLoop = this.update;
//     this.update = (...args) => {
//       stats.begin();
//       updateLoop.apply(this, args);
//       stats.end();
//     };
//   }
// }

new Game();

