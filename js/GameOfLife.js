/*
 Copyright 2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license Conway's Game of Life (c) 2014 Daniel Wirtz <dcode@dcode.io>
 * see: http://dcode.io for details
 */
(function(global) {
    
    /**
     * Creates a new Game of Life.
     * @param {number} cols Number of columns
     * @param {number} rows Number of rows
     * @param {number=} nColors Number of colors, defaults to 1
     * @returns {{universe: !Array.<!Array.<number>>, resize: function(number, number), step: function(), set: function(number, number, !Array.<!Array.<number>>=, number=}}
     */
    function GameOfLife(cols, rows, nColors) {
        nColors = nColors || 1;

        /**
         * The universe.
         * @type {!Array.<!Array.<number>>}
         */
        var universe = [];

        /**
         * Inflates the universe.
         * @inner
         */
        function inflate() {
            var x, y;
            for (y=0; y<rows; ++y) {
                if (typeof universe[y] === 'undefined')
                    universe[y] = [];
                for (x=0; x<cols; ++x)
                    if (typeof universe[y][x] === 'undefined')
                        universe[y][x] = -1;
            }
        }

        /**
         * Resizes the universe.
         * @param {number} newCols Number of columns
         * @param {number} newRows Number of rows
         */
        function resize(newCols, newRows) {
            if (newCols === cols && newRows === rows)
                return;
            rows = newRows;
            cols = newCols;
            inflate();
        }

        /**
         * Clears the universe.
         */
        function clear() {
            while (universe.length > 0)
                universe.shift();
            inflate();
        }

        /**
         * @type {!Array.<!Array.<number>>}
         * @const
         * @inner
         */
        var neighbors = [
            /* XXX */ [-1,-1], [0,-1], [1,-1],
            /* XoX */ [-1,0], [1,0],
            /* XXX */ [-1,1], [0,1], [1,1]
        ];

        /**
         * Steps to the next generation.
         */
        function step() {
            var pastUniverse = [],
                x, y, px, py;
            for (y=0; y<rows; ++y)
                pastUniverse[y] = universe[y].slice();
            var n, i,
                colorIndex, colorCount, colorCounts = new Array(nColors);
            for (y=0; y<rows; ++y) {
                for (x=0; x<cols; ++x) {
                    n = 0;
                    colorCounts = [];
                    for (i=0; i<nColors; ++i)
                        colorCounts[i] = 0;
                    for (i=0; i<8; ++i) {
                        px = x+neighbors[i][0];
                        py = y+neighbors[i][1];
                        if (exports.continuous) {
                            if (px < 0) px += cols;
                            else if (px >= cols) px -= cols;
                            if (py < 0) py += rows;
                            else if (py >= rows) py -= rows;
                        } else 
                            if (px < 0 || px >= cols || py < 0 || py >= rows)
                                continue;
                        if ((colorIndex = pastUniverse[py][px]) !== -1)
                            colorCounts[colorIndex]++, n++;
                    }
                    if (pastUniverse[y][x] !== -1) {
                        if (n < 2 || n > 3)
                            universe[y][x] = -1;
                    } else if (universe[y][x] === -1) {
                        colorIndex = 0;
                        colorCount = 0;
                        for (i=0; i<nColors; ++i)
                            if (colorCounts[i] > colorCount)
                                colorIndex = i,
                                colorCount = colorCounts[i];
                        if (n === 3)
                            universe[y][x] = colorIndex;
                    }
                }
            }
        }

        /**
         * Sets a structure.
         * @param {number} x Center X coordinate
         * @param {number} y Center Y coordinate
         * @param {!Array.<!Array.<number>>=} structure Structure to set
         * @param {number=} color Color index
         * @param {boolean=} toggle Toggles cells on or off
         */
        function set(x, y, structure, color, toggle) {
            x = x|0;
            y = y|0;
            structure = structure || [1];
            color = color || 0;
            function _set(x, y) {
                if (exports.continuous) {
                    if (x < 0) x += cols;
                    else if (x >= cols) x -= cols;
                    if (y < 0) y += rows;
                    else if (y >= rows) y -= rows;
                } else
                    if (x < 0 || x >= cols || y < 0 || y >= rows)
                        return;
                if (toggle) {
                    if (universe[y][x] === -1)
                        universe[y][x] = color;
                    else
                        universe[y][x] = -1;
                } else
                    universe[y][x] = color;
            }
            x -= (structure[0].length/2)|0;
            y -= (structure.length/2)|0;
            for (var yi=0, ym=structure.length; yi<ym; ++yi)
                for (var xi=0, xm=structure[yi].length; xi<xm; ++xi)
                    if (structure[yi][xi])
                        _set(x+xi, y+yi);
        }

        // Do the initial inflate
        inflate();

        var exports = {
            "continuous": true,
            "universe": universe,
            "resize": resize,
            "clear": clear,
            "step" : step,
            "set": set
        };
        return exports;
    }
    
    /* CommonJS */ if (typeof module !== 'undefined' && module && module['exports'])
        module.exports = GameOfLife;
    /* AMD */ else if (typeof define === 'function' && define['amd'])
        define(function() { return GameOfLife; });
    /* Global */ else
        (global['dcodeIO'] = global['dcodeIO'] || {})['GameOfLife'] = GameOfLife;
    
})(this);
