import WebpackLoader from 'phaser-webpack-loader';
import AssetManifest from '../AssetManifest';
window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');
/**
 * Preload the game and display the loading screen.
 */
export default class Preload extends Phaser.State {
  /**
   * Once loading is complete, switch to the main state.
   */
  create() {
    // Determine which postfix to use on the assets based on the DPI.
    let postfix = '';
    if (window.devicePixelRatio >= 3) {
      postfix = '@3x';
    } else if (window.devicePixelRatio > 1) {
      postfix = '@2x';
    }
    //some debugging information having to do with timing
    this.game.time.advancedTiming = true;
    // Fix CORS issues with the loader and allow for unlimited parallel downloads.
    this.game.load.crossOrigin = 'anonymous';
    this.game.load.maxParallelDownloads = Infinity;
    this.game.load.physics('physics', 'src/assets/sprites/cats2.json');

    // Begin loading all of the assets.
    this.game.plugins.add(WebpackLoader, AssetManifest)
      .load()
      .then(() => {
        this.game.state.start('Main');
      });
  }

  /**
   * Update the loading display with the progress.
   */
  update() {

  }
}
