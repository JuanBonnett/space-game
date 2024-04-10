class GG {

    static CANVAS = document.getElementById('game-canvas');
    static CTX = this.CANVAS.getContext('2d');
    static SCREEN_WIDTH = this.CANVAS.width = 800;
    static SCREEN_HEIGHT = this.CANVAS.height = 800;
    static ASSETS = {
        SPRITES : {
            BACKGROUND : { src : 'assets/bg.png', width : 800, height : 800, },
            PLAYER : { src : 'assets/ship-spritesheet.png', width : 100, height : 100, },
            PROJECTILE : { src : 'assets/laser.png', width : 80, height : 48, },
            ASTEROIDS : { src : 'assets/asteroids-s.png', width : 64, height : 64,
                          variations : {
                                1 :  { row : 0, col : 0 },
                                2 :  { row : 0, col : 1 },
                                3 :  { row : 0, col : 2 },
                                4 :  { row : 0, col : 3 },
                                5 :  { row : 1, col : 0 },
                                6 :  { row : 1, col : 1 },
                                7 :  { row : 1, col : 2 },
                                8 :  { row : 1, col : 3 },
                                9 :  { row : 2, col : 0 },
                                10 : { row : 2, col : 1 },
                                11 : { row : 2, col : 2 },
                                12 : { row : 2, col : 3 }
                            }
            },
        }, 
        AUDIO : { 
            music : 'assets/track1.mp3',
            laser : 'assets/laser.mp3',
        },
    }
    static SETTINGS = {
        maxAsteroids : 6,
        showBoxes : false,
        showPlayerVector : false,
        showPlayerPos : false,
    }
    static PLAYER_SETTINGS = {
        acceleration : 0.04,
        angle : 270,
        rotation : 0,
        torque : 0.5,
        vel : { x : 0, y : 0 },
        maxVel : 3,
        maxRotation : 3,
        projectileSpeed : 20,
    }

    static frame = 0;

}

class Input {

    static keys = {};
    
    static keyDown(key, callback) {
        window.addEventListener('keydown', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase() && !this.keys[key]?.locked) {
                callback();
            }
        });
    }

    static keyUp(key, callback) {
        window.addEventListener('keyup', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase() && !this.keys[key]?.locked) {
                callback();
            }
        });
    }

    static once(key, callback) {
        this.keys[key] = { pressed : false };
        this.keyDown(key, () => {
            if(!this.keys[key].pressed) callback();
            this.keys[key].pressed = true;
        });
        window.addEventListener('keyup', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase()) {
                this.keys[key].pressed = false;
            }
        });
    }

    static listen(key) {
        this.keys[key] = { pressed : false };
        this.once(key, () => {
            this.keys[key].pressed = true;
        });
        this.keyUp(key, () => {
            this.keys[key].pressed = false;
        });
    }

    static listenOnce() {
        this.keys[key] = { pressed : false };
        this.once(key, () => {
            this.keys[key].pressed = true;
        });
        this.keyUp(key, () => {
            this.keys[key].pressed = false;
        });
    }

    static lock(key) {
        this.keys[key] = { locked : true };
    }

    static unlock(key) {
        this.keys[key] = { locked : false };
    }

}

class GMath {

    /*
    These trigonometry functions are modified so the angles increase
    when rotating clockwise. 0 degrees point EAST and the Y axis points SOUTH.
    */

    static toRadians(deg) {
        return deg * Math.PI / 180;
    }

    static toDegrees(rad) {
        return rad * 180 / Math.PI;
    }

    static vectorAngleR(x, y) {
        let angle = Math.atan2(-y, x);
        if (angle < 0) angle += 2 * Math.PI;
        angle = (angle + Math.PI / 2) % (2 * Math.PI);
        return angle;
    }

    static vectorAngleD(x, y) {
        return this.toDegrees(vectorAngleR(y, x));
    }  

    static vectorMagnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    static pointsAngleR(x1, y1, x2, y2) {
        let angle = Math.atan2(x2 - x1, y2 - y1);
        if (angle < 0) angle += 2 * Math.PI;
        angle = (2 * Math.PI - angle + Math.PI / 2) % (2 * Math.PI);
        return angle;
    }

    static pointsAngleD(x1, y1, x2, y2) {
        return this.toDegrees(this.pointsAngleR(x1, y1, x2, y2));
    }

    static rotateVector(x, y, a, degrees = true) {
        if (degrees) a = this.toRadians(a);
        let c = Math.cos(a);
        let s = Math.sin(a);
        return { x: c * x - s * y, y: s * x + c * y }; 
    }

    static normalizeVector(x, y, scalar = 1) {
        let m = this.vectorMagnitude(x, y);
        if (m > 0) {
            let normalizedX = x / m;
            let normalizedY = y / m;
            return { x : normalizedX * scalar,  y : normalizedY * scalar};
        }
    }

    static vDistance(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static randomInt(min, max) {
        if(min === max) return min;
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max) {
        if(min === max) return min;
        return Math.random() * (max - min) + min;
    }

}

class Game {

    #starsBG;
    #player;
    #playerSpriteOffset;
    #projectiles;
    #asteroids;
    #audio;
    
    constructor() {
        this.#initGame();
        this.#initInput();
        this.#initAudio();
    }

    #initGame() {
        let starsBG = GG.ASSETS.SPRITES.BACKGROUND;
        let sbb = 10; //Screen boundaries buffer
        let asb = { //Asteroid spawn boundaries
            0 : { 
                x : { min : 0, max : GG.SCREEN_WIDTH },
                y : { min : -sbb, max : -sbb },
            },

            1 : {
                x : { min : GG.SCREEN_WIDTH + sbb, max : GG.SCREEN_WIDTH + sbb },
                y : { min : 0, max : GG.SCREEN_HEIGHT }
            },

            2 : {
                x : { min : 0, max : GG.SCREEN_WIDTH},
                y : { min : GG.SCREEN_HEIGHT + sbb, max : GG.SCREEN_HEIGHT + sbb }
            },

            3 : {
                x : { min : -sbb, max : -sbb },
                y : { min : 0, max : GG.SCREEN_HEIGHT }
            }
        }
        
        this.#starsBG = new Sprite(starsBG.src, starsBG.width, starsBG.height);

        this.#player = new Player();
        this.#player.pos.x = GG.SCREEN_WIDTH * 0.5;
        this.#player.pos.y = GG.SCREEN_HEIGHT * 0.5;
        this.#playerSpriteOffset = this.#player.width * 0.5;
        
        this.#projectiles = [];

        this.#asteroids = [];
        for(let i = 0; i < GG.SETTINGS.maxAsteroids; i++) {
            let side = GMath.randomInt(0, 3);
            let scale = GMath.randomFloat(0.5, 1.9);
            let x = GMath.randomInt(asb[side].x.min, asb[side].x.max);
            let y = GMath.randomInt(asb[side].y.min, asb[side].y.max);
            let vx, vy;

            switch(side) {
                case 0 :
                    vx = 0;
                    vy = GMath.randomFloat(0.5, 1);
                    break;
                case 1 :
                    vx = GMath.randomFloat(-0.5, -1);
                    vy = 0;
                    break;
                case 2 :
                    vx = 0;
                    vy = GMath.randomFloat(-0.5, -1);
                    break;
                case 3 :
                    vx = GMath.randomFloat(0.5, 1);
                    vy = 0;
                    break;
            }
            console.log(`Generating Asteroid at side ${side}: ${x},${y} with v = ${vx}, ${vy}`);
            this.#asteroids[i] = new Asteroid(x, y, vx, vy, scale);
        }
        console.log(this.#asteroids);
    }

    #initInput() {
        //Player
        Input.once('r', () => { 
            this.#player.reset();
            this.#player.pos.x = GG.SCREEN_WIDTH * 0.5;
            this.#player.pos.y = GG.SCREEN_WIDTH * 0.5;
        });
        Input.listen('w');
        Input.keyUp('w', () => this.#player.stopAccel());
        Input.keyDown('d', () => this.#player.rotateR());
        Input.keyDown('a', () => this.#player.rotateL());
        
        //Gameplay
        Input.once(' ', () => {
            let p = new Projectile(this.#player.pos, 
                                   this.#player.angle,
                                   this.#player.vel);
            this.#projectiles.push(p);
        });

        //Audio
        Input.once('m', () => { 
            if(this.#audio.music.playing) {
                this.#audio.music.sound.pause();
                this.#audio.music.playing = false;
            }
            else {
                this.#audio.music.sound.play(); 
                this.#audio.music.playing = true;
            }
        });
    }

    #initAudio() {
        let assets = GG.ASSETS.AUDIO;

        this.#audio = { 
            music : { 
                sound : new Audio(), 
                playing : true,
            },
        };
        this.#audio.music.sound.src = assets.music;
        this.#audio.music.sound.play();
    }

    update() {
        this.draw();
        this.#projectileLogic();
        this.#playerLogic();
        this.#asteroidsLogic();
    }

    draw() {
        GG.CTX.clearRect(0, 0, GG.SCREEN_WIDTH, GG.SCREEN_HEIGHT);
        this.#starsBG.draw(0, 0);
    }

    #playerLogic() {
        this.#player.update();

        if(this.#player.pos.x > GG.SCREEN_WIDTH + this.#playerSpriteOffset) {
            this.#player.pos.x = 0 - this.#playerSpriteOffset;
        } else if (this.#player.pos.x  < 0 - this.#playerSpriteOffset) {
            this.#player.pos.x = GG.SCREEN_WIDTH + this.#playerSpriteOffset;
        }

        if(this.#player.pos.y > GG.SCREEN_HEIGHT + this.#playerSpriteOffset) {
            this.#player.pos.y = 0 - this.#playerSpriteOffset;
        } else if (this.#player.pos.y < 0 - this.#playerSpriteOffset) {
            this.#player.pos.y = GG.SCREEN_HEIGHT + this.#playerSpriteOffset;
        }

        this.#player.draw();
    }

    #projectileLogic() {
        for(let i = 0; i < this.#projectiles.length; i++) {
            if(this.#projectiles[i].pos.x > GG.SCREEN_WIDTH || 
               this.#projectiles[i].pos.y > GG.SCREEN_HEIGHT ||
               this.#projectiles[i].pos.x < 0 || this.#projectiles[i].pos.y < 0) {

                this.#projectiles.splice(i, 1);
                i--;
                
            } else {
                this.#projectiles[i].update();
                this.#projectiles[i].draw();
            }
        }
    }

    #asteroidsLogic() {
        for(let i = 0; i < this.#asteroids.length; i++) {
            let a = this.#asteroids[i];
            this.#asteroids[i].update();

            if(a.pos.x > GG.SCREEN_WIDTH + a.sprite.width) {
                a.pos.x = 0 - a.sprite.width;
            } else if (a.pos.x  < 0 - a.sprite.width) {
                a.pos.x = GG.SCREEN_WIDTH + a.sprite.width;
            }
    
            if(a.pos.y > GG.SCREEN_HEIGHT +  a.sprite.height) {
                a.pos.y = 0 -  a.sprite.height;
            } else if (a.pos.y < 0 - a.sprite.height) {
                a.pos.y = GG.SCREEN_HEIGHT + a.sprite.height;
            }

            this.#asteroids[i].draw();
        }
    }

    get player() { return this.#player; }
    get proyectiles() { return this.#projectiles; }

}

class Sprite {

    #img;
    #sourceWidth;
    #sourceHeight;
    #width;
    #height;
    #scale;

    constructor(src, w, h, scale) {
        this.#img = new Image();
        this.#img.src = src;
        this.#sourceWidth = w;
        this.#sourceHeight = h;
        this.#scale = scale || 1;
        this.#width = w * this.scale;
        this.#height = h * this.scale;
    }

    draw(x, y, rotation) {
        let ctx = GG.CTX;

        if(rotation !== undefined) {
            let deg = GMath.toRadians(rotation);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(deg);
            ctx.drawImage(this.#img, 0, 0, this.#sourceWidth, this.#sourceHeight, 
                          -this.#width * 0.5, -this.#height * 0.5, 
                          this.#width, this.#height);
            ctx.restore();
            return;
        }
        ctx.drawImage(this.#img, 0, 0, this.#width, this.#height);
    }

    drawFromSheet(x, y, row, col, rotation = 0) {
        let ctx = GG.CTX;

        ctx.drawImage(this.img, 
                      col * this.sourceWidth, row * this.sourceHeight, 
                      this.sourceWidth, this.sourceHeight,
                      x, y,
                      this.width, this.height);
    }

    get img() { return this.#img; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get sourceWidth() { return this.#sourceWidth; }
    get sourceHeight() { return this.#sourceHeight; }
    get scale() { return this.#scale; }

    set scale(scale) { 
        this.#scale = scale; 
        this.#width = this.#sourceWidth * scale;
        this.#height = this.#sourceHeight * scale;
    }

}

class AnimatedSprite extends Sprite {

    #currentFrame;
    #currentRow;
    #staggerFrames;
    #startFrame ;
    #totalFrames;
    #animationStates;
    #activeState;

    constructor(src, w, h, scale = 1, staggerFrames = 0, totalFrames = 0) {
        super(src, w, h, scale);
        this.#staggerFrames = staggerFrames;
        this.#totalFrames = totalFrames;
        this.#startFrame = 0;
        this.#currentRow = 0;
        this.#currentFrame = this.#startFrame;
        this.#animationStates = {};
    }

    animate(x, y, rotation = 0) {
        let ctx = GG.CTX;
        let deg = GMath.toRadians(rotation);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(deg);
        ctx.drawImage(this.img, 
                      this.sourceWidth * this.#currentFrame, this.sourceHeight * this.#currentRow, 
                      this.sourceWidth, this.sourceHeight, 
                      -this.width * 0.5, -this.height * 0.5, 
                      this.width, this.height);
        ctx.restore();

        if(GG.frame % this.#staggerFrames == 0) {
            if(this.#currentFrame < this.#totalFrames) this.#currentFrame++;
            else this.#currentFrame = this.#startFrame;
        }
    }

    createAnimationState(name, row, startFrame, totalFrames, staggerFrames) {
        this.#animationStates[name] = {
            row : row,
            startFrame : startFrame,
            totalFrames : totalFrames,
            staggerFrames : staggerFrames
        }
    }

    setAnimationState(name) {
        if(name === this.#activeState) return;

        let state = this.#animationStates[name];

        this.#activeState = name;
        this.#currentRow = state.row;
        this.#startFrame = state.startFrame;
        this.#totalFrames = state.totalFrames;
        this.#staggerFrames = state.staggerFrames;
    }

    get activeState() { return this.#animationStates[this.#activeState]; }
    get animationStates() { return this.#animationStates; }
    get currentFrame() { return this.#currentFrame; }

}

class Player {

    #sprite;
    #acceleration;
    #angle;
    #rotation;
    #torque;
    #vel;
    #maxVel;
    #maxRotation;
    #isAccelerating;
    #collisionBox;

    pos;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.PLAYER;

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.8);
        this.#sprite.createAnimationState('iddle', 0, 0, 0, 10);
        this.#sprite.createAnimationState('running', 0, 3, 6, 10);
        this.#sprite.createAnimationState('blinking', 0, -1, 0, 7);
        this.#sprite.setAnimationState('iddle');
        this.#initSettings();
    }

    update() {
        this.#collisionBox = {
            x : this.pos.x - this.#sprite.width * 0.5,
            y : this.pos.y - this.#sprite.height * 0.5,
            w : this.#sprite.width,
            h : this.#sprite.height,
        }

        this.#updateFromInput();
        this.#updatePosition();
        this.#updateOrientation();
    }

    draw() {
        this.#sprite.animate(this.pos.x, this.pos.y, this.#angle);
        if(GG.SETTINGS.showPlayerVector) this.#visualizeVelocityVector();
        if(GG.SETTINGS.showPlayerPos) this.#visualizePos();
        if(GG.SETTINGS.showBoxes) this.#visualizeBox();
    }

    #initSettings() {
        let settings = GG.PLAYER_SETTINGS;

        this.pos = { x : 0, y : 0 };
        this.#acceleration = settings.acceleration;
        this.#angle = settings.angle;
        this.#rotation = settings.rotation;
        this.#torque = settings.torque;
        this.#vel = { ...settings.vel };
        this.#maxVel = settings.maxVel;
        this.#maxRotation = settings.maxRotation;
        this.#isAccelerating = false;
    }

    #updateFromInput() {
        if(Input.keys.w?.pressed) {
            if(!this.#isAccelerating) {
                this.#sprite.setAnimationState('running');
            }
            this.accel(); 
        }
    }

    #updatePosition() {
        this.pos.x += this.#vel.x;
        this.pos.y += this.#vel.y;
    }

    #updateOrientation() {
        if(this.#angle < 0 ) this.#angle = 360;
        else if(this.#angle > 360) this.#angle = 0;
        else this.#angle += this.#rotation;
    }

    accel() {
        let accelX = Math.cos(GMath.toRadians(this.#angle)) * this.#acceleration;
        let accelY = Math.sin(GMath.toRadians(this.#angle)) * this.#acceleration;
        let vMag;
    
        this.#isAccelerating = true;
        this.#vel.x += accelX;
        this.#vel.y += accelY;
        vMag = GMath.vectorMagnitude(this.#vel.x, this.#vel.y);
        
        if (vMag > this.#maxVel) {
            this.#vel = GMath.normalizeVector(this.#vel.x, this.#vel.y, this.#maxVel);
        }
    }

    stopAccel() {
        this.#isAccelerating = false;
        this.#sprite.setAnimationState('iddle');
    }

    rotateR() { 
        if(this.#rotation + this.#torque > this.#maxRotation) {
            this.#rotation = this.#maxRotation;
            return;
        }
        this.#rotation += this.#torque; 
    }

    rotateL() { 
        if(this.#rotation - this.#torque < this.#maxRotation * -1) {
            this.#rotation = this.#maxRotation * -1;
            return;
        }
        this.#rotation -= this.#torque; 
    }

    reset() {
        this.sprite.setAnimationState('blinking');
        Input.lock('w');
        setTimeout(() => {
            this.sprite.setAnimationState('iddle');
            Input.unlock('w');
        }, 1000);
        this.#initSettings();
    }

    #visualizeVelocityVector(scale = 50) {
        let posX = this.pos.x;
        let posY = this.pos.y;

        GG.CTX.beginPath();
        GG.CTX.moveTo(posX, posY);
        GG.CTX.lineTo(posX + this.#vel.x * scale, posY + this.#vel.y * scale);
        GG.CTX.lineWidth = 2;
        GG.CTX.strokeStyle = 'lime';
        GG.CTX.stroke();
    }

    #visualizePos() {
        GG.CTX.beginPath();
        GG.CTX.arc(this.pos.x, this.pos.y, 5, 0, 2 * Math.PI);
        GG.CTX.fillStyle = 'lime';
        GG.CTX.fill();
    }

    #visualizeBox() {
        GG.CTX.strokeStyle = 'lime';
        GG.CTX.strokeRect(this.#collisionBox.x, this.#collisionBox.y, 
                          this.#collisionBox.w, this.#collisionBox.h);
    }   

    get vel() { return this.#vel; }
    get rotation() { return this.#rotation; }
    get angle() { return this.#angle; }
    get width() { return this.#sprite.width; }
    get height() { return this.#sprite.height; } 
    get sprite() { return this.#sprite; }
    get isAccelerating() { return this.#isAccelerating; }

}

class Projectile {

    pos;
    #angle;
    #vel;
    #speed;
    #sprite;
    #sound;

    constructor(pos, a, pv) {
        let sprite = GG.ASSETS.SPRITES.PROJECTILE;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, 0.5);
        this.#sound = new Audio();
        this.#sound.src = GG.ASSETS.AUDIO.laser;
        this.pos = { x : pos.x, y : pos.y };
        this.#angle = a;
        this.#speed = GG.PLAYER_SETTINGS.projectileSpeed;
        this.#vel = { 
            x : Math.cos(GMath.toRadians(this.#angle)) * this.#speed + pv.x, 
            y : Math.sin(GMath.toRadians(this.#angle)) * this.#speed + pv.y, 
        }
        
        this.#sound.play();
    }

    update() {
        this.pos.x += this.#vel.x;
        this.pos.y += this.#vel.y;
    }

    draw() {
        this.#sprite.draw(this.pos.x, this.pos.y, this.#angle);
    }

}

class Asteroid {

    #sprite;
    #pos;
    #vel;
    #variations;
    #variation;

    constructor(x, y, vx, vy, _scale, variation) {
        let sprite = GG.ASSETS.SPRITES.ASTEROIDS;
        let scale = _scale || 1;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, scale);
        this.#pos = { x : x, y : y };
        this.#vel = { x : vx, y : vy };
        this.#variations = sprite.variations;
        this.#variation = variation || GMath.randomInt(1, 12);
    }

    update() {
        this.#pos.x += this.#vel.x;
        this.#pos.y += this.#vel.y;
    }

    draw() {
        this.#sprite.drawFromSheet(this.#pos.x, this.#pos.y, 
                                   this.#variations[this.#variation].row,
                                   this.#variations[this.#variation].col);
        if(GG.SETTINGS.showBoxes) this.#visualizeBox();
    }

    #visualizeBox() {
        GG.CTX.strokeStyle = 'lime';
        GG.CTX.strokeRect(this.#pos.x, this.#pos.y, this.#sprite.width, this.#sprite.height);
    }

    get pos() { return this.#pos; }
    get sprite() { return this.#sprite; }

}

const DATA = document.getElementById('data');
const GAME = new Game();
const run = () => {
    GAME.update();
    /*
    updateData('Frame: ' + GG.frame +
               '&nbsp;&nbsp;&nbsp;&nbsp;' +
               'vx: ' + GAME.player.vel.x.toFixed(3) + ' | vy: ' + GAME.player.vel.y.toFixed(3) + 
               '&nbsp;&nbsp;&nbsp;&nbsp;' + 
               'px: ' + GAME.player.pos.x.toFixed(2) + '| py: ' + GAME.player.pos.y.toFixed(2) +
               '&nbsp;&nbsp;&nbsp;&nbsp;' + 
               'a: ' + GAME.player.angle.toFixed(2) + ' r: ' + GAME.player.rotation.toFixed(2));
    */
    GG.frame++;
    requestAnimationFrame(run);
};

/*
const updateData = (_data) => {
    DATA.innerHTML = _data;
};
*/

run();