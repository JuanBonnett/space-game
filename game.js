class GG {

    static CANVAS = document.getElementById('game-canvas');
    static CTX = this.CANVAS.getContext('2d');
    static SCREEN_WIDTH = this.CANVAS.width = 800;
    static SCREEN_HEIGHT = this.CANVAS.height = 800;
    static SCREEN_CENTER = { x : this.SCREEN_WIDTH * 0.5, y : this.SCREEN_HEIGHT * 0.5 };
    static ASSETS = {
        SPRITES : {
            BACKGROUND : { src : 'assets/bg.png', width : 800, height : 800, },
            P_BACKGROUND : { src : 'assets/p-bg.png', width : 1600, height : 800, },
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
            EXPLOSIONS :{
                1 : { src : 'assets/explosion1.png', width : 96, height : 96, },
                2 : { src : 'assets/explosion2.png', width : 96, height : 96 },
                3 : { src : 'assets/explosion3.png', width : 96, height : 96 },
                4 : { src : 'assets/explosion4.png', width : 96, height : 96 },
            },
        }, 
        AUDIO : { 
            music : 'assets/track1.mp3',
            laser : 'assets/laser.mp3',
            playerExplosion : 'assets/explosion.wav',
        },
    }
    static SETTINGS = {
        maxAsteroids : 10,
        initMaxAsteroidVel : 1,
        initMinAsteroidVel : 0.2,
        maxAsteroidVel : 1,
        minAsteroidVel : 0.2,
        showBoxes : false,
        showPlayerVector : false,
        showPos : false,
        enableSound : false,
        antialiasing : false,
        projectilesPoolSize  : 10,
        baseAsteroidScore : 100,
        scoreSlope : 0.000000005,
    }
    static PLAYER_SETTINGS = {
        acceleration : 0.02,
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

class DOMUI {

    static start = document.getElementById('ui-start');
    static pause = document.getElementById('ui-pause');
    static score = document.getElementById('score-count');
    static record = document.getElementById('record-count');

    static showStartScreen() {
        this.start.style.display = 'flex';
    }

    static hideStartScreen() { 
        this.start.style.display = 'none';
    }

    static togglePause(paused) {
        if(paused) this.pause.style.display = 'flex';
        else this.pause.style.display = 'none';
    }

    static updateScore(score) {
        let s = parseInt(score);
        this.score.innerText = String(s).padStart(10, '0');
    }

    static updateRecord(record) {
        let r = parseInt(record);
        this.record.innerText = String(r).padStart(10, '0');
    }

    static getScore() { return parseInt(this.score.innerText); }
    static getRecord() { return parseInt(this.record.innerText); }

}

class Game {

    #paused;
    #starsBG;
    #player;
    #playerSpriteOffset;
    #renderPlayer;
    #asteroids;
    #explosions;
    #audio;
    #score;
    #record;
    
    constructor() {
        let starsBG = GG.ASSETS.SPRITES.P_BACKGROUND;
        
        this.#starsBG = new Sprite(starsBG.src, starsBG.width, starsBG.height);

        this.#player = new Player();
        this.#player.pos.x = GG.SCREEN_CENTER.x;
        this.#player.pos.y = GG.SCREEN_CENTER.y;
        this.#playerSpriteOffset = this.#player.width * 0.5;
        this.#renderPlayer = true;

        this.#paused = true;
        this.#score = 0;
        this.#record = 0;

        this.#initGame();
        this.#initInput();

        GG.CTX.imageSmoothingEnabled = GG.SETTINGS.antialiasing;
    }

    #initGame() {
        ProjectileController.createPool();
        /* CODE FOR TESTING WITH INDIVIDUAL ASTEROIDS
        this.#asteroids = [];
        this.#asteroids[0] = AsteroidController.create(200, 200, 0, 0);
        */
        this.#asteroids = AsteroidController.createPool();
        this.#explosions = [];
    }

    #initInput() {
        //UI
        Input.once('enter', () => {
            this.#paused = false;
            DOMUI.hideStartScreen();
            this.#initAudio();
        });

        //Player
        Input.once('r', () => { 
            this.#player.reset();
            this.#player.pos = { x : GG.SCREEN_CENTER.x, y : GG.SCREEN_CENTER.y };
        });
        Input.listen('w');
        Input.keyUp('w', () => this.#player.stopAccel());
        Input.keyDown('d', () => this.#player.rotateR());
        Input.keyDown('a', () => this.#player.rotateL());
        
        //Gameplay
        Input.once(' ', () => {
            if(this.#paused) return;
            ProjectileController.shoot(this.#player.pos, this.#player.angle, this.#player.vel);
        });

        //Audio
        Input.once('m', () => { 
            if(this.#audio.music.playing) {
                this.#audio.music.sound.pause();
                this.#audio.music.playing = false;
                GG.SETTINGS.enableSound = false;
            }
            else {
                this.#audio.music.sound.play(); 
                this.#audio.music.playing = true;
                GG.SETTINGS.enableSound = true;
            }
        });

        Input.once('p', () => this.pause());
    }

    #initAudio() {
        let assets = GG.ASSETS.AUDIO;

        this.#audio = { 
            music : { 
                sound : new Audio(), 
                playing : false,
            },
            playerExplosion : new Audio(),
        };
        this.#audio.music.sound.src = assets.music;
        this.#audio.playerExplosion.src = assets.playerExplosion;
        if(GG.SETTINGS.enableSound) {
            this.#audio.music.sound.play();
            this.#audio.music.playing = true;
        }
    }

    update() {
        if(this.#paused) return;
        this.draw();
        this.#projectileLogic();
        this.#playerLogic();
        this.#asteroidsLogic();
        this.#explosionsLogic();

        GG.SETTINGS.maxAsteroidVel += GG.SETTINGS.scoreSlope * this.#score;
        GG.SETTINGS.minAsteroidVel += GG.SETTINGS.scoreSlope * this.#score;

        GG.frame++;
    }

    draw() {
        GG.CTX.clearRect(0, 0, GG.SCREEN_WIDTH, GG.SCREEN_HEIGHT);
        this.#starsBG.draw(0, 0);
    }

    pause() {
        if(this.#paused) this.#paused = false;
        else this.#paused = true;
        DOMUI.togglePause(this.#paused);
    }

    #playerLogic() {
        if(!this.#renderPlayer) return;

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
        let toBeRemoved = [];
        
        for(let i = 0; i < ProjectileController.activeProjectiles.length; i++) {
            let p = ProjectileController.activeProjectiles[i];

            if(p.pos.x > GG.SCREEN_WIDTH || p.pos.y > GG.SCREEN_HEIGHT ||
               p.pos.x < 0 || p.pos.y < 0) {
                toBeRemoved.push(p);
            } else {
                p.update();
                p.draw();
                for(let j = 0; j < this.#asteroids.length; j++) {
                    let a = this.#asteroids[j];
                    if(p.collisionBox.SATCollides(a.collisionBox)) {
                        this.#explosions.push(new Explosion(a.pos.x, a.pos.y, a.sprite.scale * 2));
                        AsteroidController.respawn(a);
                        toBeRemoved.push(p);
                        this.#score += GG.SETTINGS.baseAsteroidScore - a.sprite.scale;
                        DOMUI.updateScore(this.#score);
                        break;
                    }
                }
            }
        }

        for(let i = 0; i < toBeRemoved.length; i++) {
            let p = toBeRemoved[i];
            ProjectileController.reset(p);
        }

        ProjectileController.activeProjectiles = ProjectileController.activeProjectiles.filter(
            (p) => !toBeRemoved.includes(p)
        );
    }

    #asteroidsLogic() {
        if(this.#asteroids.length < GG.SETTINGS.maxAsteroids) {
            //console.log('NEED TO ADD AN ASTEROID');
            this.#asteroids.push(AsteroidController.createPool(1)[0]);
        }

        for(let i = 0; i < this.#asteroids.length; i++) {
            let a = this.#asteroids[i];
            a.update();

            //SCREEN BOUNDARIES
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

            //COLLISION WITH PLAYER
            if(a.collisionBox.SATCollides(this.#player.collisionBox)) {
                this.#playerCollidedWithAasteroid();
            }

            a.draw();
        }
    }

    #explosionsLogic() {
        if(this.#explosions.length > 0) {
            for(let i = 0; i < this.#explosions.length; i++) {
                let e = this.#explosions[i];
                e.draw();

                if(e.sprite.animationDone) {
                    this.#explosions.splice(i, 1);
                    i--;
                }
            }
        }
    }

    #playerCollidedWithAasteroid() {
        if(this.#player.isInvulnerable) return;

        if(GG.SETTINGS.enableSound) this.#audio.playerExplosion.play();
        this.#player.hasCollided = true;
        this.#player.isInvulnerable = true;
        this.#explosions.push(new Explosion(this.#player.pos.x, this.#player.pos.y, 
                                            this.#player.sprite.scale * 4, 4));
        this.#renderPlayer = false;
        if(this.#score > this.#record) this.#record = this.#score;
        this.#score = 0
        DOMUI.updateScore(0);
        DOMUI.updateRecord(this.#record);
        GG.SETTINGS.maxAsteroidVel = GG.SETTINGS.initMaxAsteroidVel;
        GG.SETTINGS.minAsteroidVel = GG.SETTINGS.initMinAsteroidVel;
        setTimeout(() =>{
            this.#initGame();
            this.#renderPlayer = true;
            this.#player.isInvulnerable = false;
            this.#player.reset();
            this.#player.pos = { x : GG.SCREEN_CENTER.x, y : GG.SCREEN_CENTER.y };
        }, 3000);
    }

    get player() { return this.#player; }

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

    drawFromSheet(x, y, row, col, rotation) {
        let ctx = GG.CTX;

        if(rotation !== undefined) {
            let deg = GMath.toRadians(rotation);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(deg);
            ctx.drawImage(this.#img, col * this.sourceWidth, row * this.sourceHeight, 
                          this.#sourceWidth, this.#sourceHeight, 
                          -this.#width * 0.5, -this.#height * 0.5, 
                          this.#width, this.#height);
            ctx.restore();
            return;
        }
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
    #cols;
    #rows;
    #once;
    #animationDone;

    constructor(src, w, h, scale, staggerFrames, totalFrames, cols, rows, once) {
        super(src, w, h, scale || 1);
        this.#staggerFrames = staggerFrames || 0;
        this.#totalFrames = totalFrames || 0;
        this.#cols = cols || 0;
        this.#rows = rows || 0;
        this.#startFrame = 0;
        this.#currentRow = 0;
        this.#currentFrame = this.#startFrame;
        this.#once = once || false;
        this.#animationDone = false;
        this.#animationStates = {};
    }

    animateRow(x, y, rotation = 0) {
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

    animate(x, y, rotation = 0) {
        if(this.#animationDone && this.#once) return;
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
            if(this.#currentFrame < this.#cols) this.#currentFrame++;
            else { 
                this.#currentFrame = this.#startFrame;
                if(this.#currentRow < this.#rows) this.#currentRow++;
                else { 
                    this.#currentRow = 0; this.#animationDone = true; 
                }
            }
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
    get animationDone() { return this.#animationDone; }

    set animationDone(val) {
        if(val !== true && val !== false) return;
        this.#animationDone = val;
    }

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
    #isInvulnerable;

    pos;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.PLAYER;

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.8);
        this.#sprite.createAnimationState('iddle', 0, 0, 0, 10);
        this.#sprite.createAnimationState('running', 0, 3, 6, 10);
        this.#sprite.createAnimationState('blinking', 0, -1, 0, 7);
        this.#sprite.setAnimationState('iddle');
        this.#initSettings();
        this.#collisionBox = new CollisionBox(this.pos.x, this.pos.y, this.#sprite.width, this.#sprite.height);
    }

    update() {
        this.#updateFromInput();
        this.#updatePosition();
        this.#updateOrientation();
        this.#collisionBox.translate(this.pos.x - this.#sprite.width * 0.5, 
            this.pos.y - this.#sprite.height * 0.5);
    }

    draw() {
        this.#sprite.animateRow(this.pos.x, this.pos.y, this.#angle);
        if(GG.SETTINGS.showPlayerVector) this.#visualizeVelocityVector();
        if(GG.SETTINGS.showPos) this.#visualizePos();
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
                          this.#collisionBox.width, this.#collisionBox.height);
    }   

    get vel() { return this.#vel; }
    get rotation() { return this.#rotation; }
    get angle() { return this.#angle; }
    get width() { return this.#sprite.width; }
    get height() { return this.#sprite.height; } 
    get sprite() { return this.#sprite; }
    get isAccelerating() { return this.#isAccelerating; }
    get collisionBox() { return this.#collisionBox; }
    get isInvulnerable() { return this.#isInvulnerable; }

    set isInvulnerable(val) {
        if(val !== true && val !== false) return;
        this.#isInvulnerable = val;
    }

}

class Projectile {

    pos;
    #angle;
    #vel;
    #speed;
    #sprite;
    #sound;
    #collisionBox;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.PROJECTILE;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, 0.5);
        this.#sound = new Audio();
        this.#sound.src = GG.ASSETS.AUDIO.laser;
    }

    init(pos, a, pv) {
        this.pos = { x : pos.x || 0, y : pos.y || 0 };
        this.#angle = a || 0;
        this.#speed = GG.PLAYER_SETTINGS.projectileSpeed;
        this.#vel = { 
            x : Math.cos(GMath.toRadians(this.#angle)) * this.#speed + pv.x, 
            y : Math.sin(GMath.toRadians(this.#angle)) * this.#speed + pv.y, 
        }
        this.#collisionBox = new CollisionBox(this.pos.x - this.#sprite.width * 0.5, 
                                              this.pos.y - this.#sprite.height * 0.5, 
                                              this.#sprite.width, this.#sprite.height,
                                              0.5);
    }

    update() {
        this.pos.x += this.#vel.x;
        this.pos.y += this.#vel.y;

        this.#collisionBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                                     this.pos.y - this.#sprite.height * 0.5);
    }

    draw() {
        this.#sprite.draw(this.pos.x, this.pos.y, this.#angle);
        if(GG.SETTINGS.showBoxes) this.#visualizeBox();
    }

    #visualizeBox() {
        GG.CTX.strokeStyle = 'lime';
        GG.CTX.strokeRect(this.#collisionBox.x, this.#collisionBox.y, 
                          this.#collisionBox.width, this.#collisionBox.height);
    }  

    playSound() {
        if(GG.SETTINGS.enableSound) this.#sound.play();
    }

    get collisionBox() { return this.#collisionBox; }

}

class ProjectileController {

    static inactiveProjectiles = [];
    static activeProjectiles = [];

    static createPool(_number) {
        let number = _number || GG.SETTINGS.projectilesPoolSize;

        for(let i = 0; i < number; i++) {
            this.inactiveProjectiles[i] = new Projectile();
        }
    }

    static shoot(pos, a, pv) {
        let p = this.inactiveProjectiles.pop();
        p.init(pos, a, pv);
        p.playSound();
        this.activeProjectiles.push(p);
    }

    static reset(projectile) {
        if(!(projectile instanceof Projectile)) return;
        this.inactiveProjectiles.unshift(projectile);
    }

}

class Asteroid {

    #sprite;
    #pos;
    #vel;
    #variations;
    #variation;
    #rotation;
    #angle;
    #scale;
    #collisionBox;

    constructor(x, y, vx, vy, scale, rotation, variation) {
        let sprite = GG.ASSETS.SPRITES.ASTEROIDS;

        this.#scale = scale || 1;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, this.#scale);
        this.#pos = { x : x, y : y };
        this.#vel = { x : vx, y : vy };
        this.#rotation = rotation || 0;
        this.#angle = 0;
        this.#variations = sprite.variations;
        this.#variation = variation || GMath.randomInt(1, Object.keys(sprite.variations).length);
        this.#collisionBox = new CollisionBox(this.#pos.x - this.#sprite.width * 0.5, 
                                              this.#pos.y - this.#sprite.height * 0.5, 
                                              this.#sprite.width, this.#sprite.height,
                                              0.8);
    }

    update() {
        this.#pos.x += this.#vel.x;
        this.#pos.y += this.#vel.y;

        this.#collisionBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                                     this.pos.y - this.#sprite.height * 0.5);

        if(this.#angle < 0 ) this.#angle = 360;
        else if(this.#angle > 360) this.#angle = 0;
        else this.#angle += this.#rotation;
    }

    draw() {
        this.#sprite.drawFromSheet(this.#pos.x, this.#pos.y, 
                                   this.#variations[this.#variation].row,
                                   this.#variations[this.#variation].col, this.#angle);
        if(GG.SETTINGS.showBoxes) this.#visualizeBox();
        if(GG.SETTINGS.showPos) this.#visualizePos();
    }

    #visualizeBox() {
        GG.CTX.strokeStyle = 'lime';
        GG.CTX.strokeRect(this.#collisionBox.x, this.#collisionBox.y, 
                          this.#collisionBox.width, this.#collisionBox.height);
    }  

    #visualizePos() {
        GG.CTX.beginPath();
        GG.CTX.arc(this.#pos.x, this.#pos.y, 5, 0, 2 * Math.PI);
        GG.CTX.fillStyle = 'lime';
        GG.CTX.fill();
    }

    get pos() { return this.#pos; }
    get sprite() { return this.#sprite; }
    get collisionBox() { return this.#collisionBox; }

    set pos(pos) { this.#pos = pos; }
    set vel(vel) { this.#vel = vel; }
    set rotation(val) { this.#rotation = val; }

}

class AsteroidController {

    static asteroids = [];
    static maxScale = 1.9;
    static minScale = 0.5;
    static sbb = 100; //Screen boundaries buffer
    static asb = { //Asteroid spawn boundaries
        0 : { 
            x : { min : 0, max : GG.SCREEN_WIDTH },
            y : { min : -this.sbb, max : -this.sbb },
        },

        1 : {
            x : { min : GG.SCREEN_WIDTH + this.sbb, max : GG.SCREEN_WIDTH + this.sbb },
            y : { min : 0, max : GG.SCREEN_HEIGHT }
        },

        2 : {
            x : { min : 0, max : GG.SCREEN_WIDTH},
            y : { min : GG.SCREEN_HEIGHT + this.sbb, max : GG.SCREEN_HEIGHT + this.sbb }
        },

        3 : {
            x : { min : -this.sbb, max : -this.sbb },
            y : { min : 0, max : GG.SCREEN_HEIGHT }
        }
    };

    static createPool(_number) {
        let number = _number || GG.SETTINGS.maxAsteroids;

        for(let i = 0; i < number; i++) {
            this.asteroids[i] = this.createRandom();
        }
        return this.asteroids;
    }

    static createRandom() {
        let spawn = this.randomizeSpawn();
        return new Asteroid(spawn.pos.x, spawn.pos.y, spawn.vel.x, spawn.vel.y, 
                            spawn.scale, spawn.rotation);
    }

    static randomizeSpawn() {
        let st = GG.SETTINGS;
        let side = GMath.randomInt(0, 3);
        let scale = GMath.randomFloat(this.minScale, this.maxScale);
        let x = GMath.randomInt(this.asb[side].x.min, this.asb[side].x.max);
        let y = GMath.randomInt(this.asb[side].y.min, this.asb[side].y.max);
        let rotation = GMath.randomFloat(-1, 1);
        let vx, vy;

        switch(side) {
            case 0 :
                vx = GMath.randomFloat(-st.minAsteroidVel, st.minAsteroidVel);
                vy = GMath.randomFloat(st.minAsteroidVel, st.maxAsteroidVel);
                break;
            case 1 :
                vx = GMath.randomFloat(-st.minAsteroidVel, -st.maxAsteroidVel);
                vy = GMath.randomFloat(-st.minAsteroidVel, st.minAsteroidVel);
                break;
            case 2 :
                vx = GMath.randomFloat(-st.minAsteroidVel, st.minAsteroidVel);
                vy = GMath.randomFloat(-st.minAsteroidVel, -st.maxAsteroidVel);
                break;
            case 3 :
                vx = GMath.randomFloat(st.minAsteroidVel, st.maxAsteroidVel);
                vy = GMath.randomFloat(-st.minAsteroidVel, st.minAsteroidVel);
                break;
        }

        return { 
            pos : { x : x, y : y },
            vel : { x : vx, y : vy },
            rotation : rotation,
            scale : scale,
        }
    }

    static respawn(asteroid) {
        if(!(asteroid instanceof Asteroid)) return;
        let spawn = this.randomizeSpawn();
        asteroid.pos = { x : spawn.pos.x, y : spawn.pos.y };
        asteroid.vel = { x : spawn.vel.x, y : spawn.vel.y };
        asteroid.rotation = spawn.rotation;
    }

}

class CollisionBox {

    #oWidth;
    #oHeight;
    #width; 
    #height;
    #scale
    x; y; 
    hasCollided;

    constructor(x, y, w, h, scale) {
        this.#oWidth = w;
        this.#oHeight = h;
        this.#scale = scale || 1;
        this.#width = w * this.#scale;
        this.#height = h * this.#scale;
        this.x = x + (this.#oWidth - this.#width) * 0.5;
        this.y = y + (this.#oHeight - this.#height) * 0.5;
        this.hasCollided = false;
    }

    translate(x, y) {
        this.x = x + (this.#oWidth - this.#width) * 0.5;
        this.y = y + (this.#oHeight - this.#height) * 0.5;
    }

    SATCollides(box) {
        if(!(box instanceof CollisionBox)) return;
        let thisHalfW = this.#width * 0.5;
        let thisHalfH = this.#height * 0.5;
        let thatHalfW = box.width * 0.5;
        let thatHalfH = box.height * 0.5;
        let thisHalf = { 
            x : this.x + thisHalfW,
            y : this.y + thisHalfH
        }
        let thatHalf = {
            x : box.x + thatHalfW,
            y : box.y + thatHalfH
        }
        let d = GMath.vDistance(thisHalf.x, thisHalf.y, thatHalf.x, thatHalf.y);

        if(d <= (thisHalfW + thatHalfW) && d <= (thisHalfH + thatHalfH)) {
            return true;
        }
        return false;
    }

    AABBCollides(box) {
        if(!(box instanceof CollisionBox)) return;
        if(this.x + this.#width >= box.x &&
           this.x <= box.x + box.width &&
           this.y + this.#height >= box.y &&
           this.y <= box.y + box.height) {

            return true;
        }
        return false;
    }

    get width() { return this.#width; }
    get height() { return this.#height; }

}

class Explosion {

    #x; #y;
    #sprite;
    #rotation;

    constructor(x, y, scale, _variation) {
        let variation = _variation || GMath.randomInt(1, 3);
        let sprite = GG.ASSETS.SPRITES.EXPLOSIONS[variation];
        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, scale || 1, 1, 64, 8, 8, true);
        this.x = x;
        this.y = y;
        this.#rotation = GMath.randomInt(1, 360);
    }

    update() {}

    draw() {
        this.#sprite.animate(this.x, this.y, this.#rotation);
    }

    get sprite() { return this.#sprite; }

}

const GAME = new Game();
const run = () => {
    GAME.update();
    requestAnimationFrame(run);
};

run();