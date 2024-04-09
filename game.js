class GG {

    static CANVAS = document.getElementById('game-canvas');
    static CTX = this.CANVAS.getContext('2d');
    static SCREEN_WIDTH = this.CANVAS.width = 800;
    static SCREEN_HEIGHT = this.CANVAS.height = 800;
    static ASSETS = {
        SPRITES : {
            BACKGROUND : { src : 'assets/bg.png', width : 800, height : 800, },
            PLAYER : { src : 'assets/ship-spritesheet.png', width : 100, height : 100, },
            PROJECTILE : { src : 'assets/projectile-spritesheet.png', width : 74, height : 52, },
        }, 
        AUDIO : { 
            music : 'assets/track1.mp3',
            laser : 'assets/laser.mp3',
        },
    }
    static PLAYER_SETTINGS = {
        acceleration : 0.04,
        angle : 270,
        rotation : 0,
        torque : 0.5,
        vel : { x : 0, y : 0 },
        maxVel : 3,
        maxRotation : 3,
        projectileSpeed : 15,
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

}

class Game {

    #starsBG;
    #player;
    #playerSpriteOffset;
    #projectiles;
    #audio;
    
    constructor() {
        this.#initGame();
        this.#initInput();
        this.#initAudio();
    }

    #initGame() {
        let starsBG = GG.ASSETS.SPRITES.BACKGROUND;
        
        this.#starsBG = new Sprite(starsBG.src, starsBG.width, starsBG.height);

        this.#player = new Player();
        this.#player.pos.x = GG.SCREEN_WIDTH * 0.5;
        this.#player.pos.y = GG.SCREEN_HEIGHT * 0.5;
        this.#playerSpriteOffset = this.#player.width * 0.5;
        this.#projectiles = [];
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
            let p = new Projectile(this.#player.pos.x, 
                                   this.#player.pos.y, 
                                   this.#player.angle);
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

    constructor(src, w, h, scale = 1) {
        this.#img = new Image();
        this.#img.src = src;
        this.#sourceWidth = w;
        this.#sourceHeight = h;
        this.#width = w * scale;
        this.#height = h * scale;
        this.#scale = scale;
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
        ctx.drawImage(this.#img, x, y, this.#width, this.#height);
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
    offset;

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

        return;
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

    pos;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.PLAYER;

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.7);
        this.#sprite.createAnimationState('iddle', 0, 0, 0, 10);
        this.#sprite.createAnimationState('startup', 0, 0, 3, 10);
        this.#sprite.createAnimationState('running', 0, 3, 6, 10);
        this.#sprite.createAnimationState('blinking', 0, -1, 0, 7);
        this.#sprite.setAnimationState('iddle');

        this.#initSettings();
    }

    update() {
        this.#updateFromInput();
        this.#updatePosition();
        this.#updateOrientation();
    }

    draw() {
        this.#sprite.animate(this.pos.x, this.pos.y, this.#angle);
        //this.#visualizeVelocityVector();
        //this.#visualizePos();
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

    constructor(x, y, a) {
        let sprite = GG.ASSETS.SPRITES.PROJECTILE;
        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.4, 5, 5);
        this.#sound = new Audio();
        this.#sound.src = GG.ASSETS.AUDIO.laser;
        this.pos = { x : x, y : y };
        this.pos.x = x;
        this.pos.y = y;
        this.#angle = a;
        this.#vel = { x : 0, y : 0 }
        this.#speed = GG.PLAYER_SETTINGS.projectileSpeed;

        this.#sound.play();
    }

    update() {
        this.#vel.x = Math.cos(GMath.toRadians(this.#angle)) * this.#speed;
        this.#vel.y = Math.sin(GMath.toRadians(this.#angle)) * this.#speed;
        this.pos.x += this.#vel.x;
        this.pos.y += this.#vel.y;
    }

    draw() {
        this.#sprite.animate(this.pos.x, this.pos.y, this.#angle);
        /*
        GG.CTX.beginPath();
        GG.CTX.arc(this.pos.x, this.pos.y, 4, 0, 2 * Math.PI);
        GG.CTX.fillStyle = 'magenta';
        GG.CTX.fill();
        */
    }

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

const updateData = (_data) => {
    DATA.innerHTML = _data;
};

run();
