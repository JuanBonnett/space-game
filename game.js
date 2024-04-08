class GameGlobals {

    static CANVAS = document.getElementById('game-canvas');
    static CTX = this.CANVAS.getContext('2d');
    static SCREEN_WIDTH = this.CANVAS.width = 800;
    static SCREEN_HEIGHT = this.CANVAS.height = 800;
    static ASSETS = {
        PLAYER_SPRITE : { src : 'assets/ship-spritesheet.png', width : 100, height : 100, },
        BACKGROUNDS_SPRITES : [
            { src : 'assets/bg.png', width : 800, height : 800, }
        ]
    }
    static PLAYER_SETTINGS = {
        acceleration : 0.04,
        angle : 270,
        rotation : 0,
        torque : 0.5,
        vel : { x : 0, y : 0 },
        maxVel : 3,
        maxRotation : 3,
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
    
    constructor() {
        this.#initGame();
        this.#initInput();
    }

    #initGame() {
        let starsBG = GameGlobals.ASSETS.BACKGROUNDS_SPRITES[0];
        
        this.#starsBG = new Sprite(starsBG.src, starsBG.width, starsBG.height);

        this.#player = new Player();
        this.#player.pos.x = GameGlobals.SCREEN_WIDTH * 0.5 - (this.#player.width * 0.5) * this.#player.sprite.scale;
        this.#player.pos.y = GameGlobals.SCREEN_WIDTH * 0.5 -(this.#player.height * 0.5) * this.#player.sprite.scale;
    }

    #initInput() {
        //Player
        Input.once('r', () => { 
            this.#player.reset();
            this.#player.pos.x = GameGlobals.SCREEN_WIDTH * 0.5 - this.#player.width * 0.5;
            this.#player.pos.y = GameGlobals.SCREEN_WIDTH * 0.5 - this.#player.height * 0.5;
        });
        Input.listen('w');
        Input.keyUp('w', () => this.#player.stopAccel());
        Input.keyDown('d', () => this.#player.rotateR());
        Input.keyDown('a', () => this.#player.rotateL());
    }

    update() {
        this.draw();
        this.#playerLogic();
    }

    draw() {
        GameGlobals.CTX.clearRect(0, 0, GameGlobals.SCREEN_WIDTH, GameGlobals.SCREEN_HEIGHT);
        this.#starsBG.draw(0, 0);
        this.#player.draw();
    }

    #playerLogic() {
        this.#player.update();
        if(this.#player.pos.x > GameGlobals.SCREEN_WIDTH) {
            this.#player.pos.x = 0 - this.#player.sprite.width;
        } else if (this.#player.pos.x  < 0 - this.#player.sprite.width) {
            this.#player.pos.x = GameGlobals.SCREEN_WIDTH;
        }

        if(this.#player.pos.y > GameGlobals.SCREEN_HEIGHT) {
            this.#player.pos.y = 0 - this.#player.sprite.width;
        } else if (this.#player.pos.y < 0 - this.#player.sprite.width) {
            this.#player.pos.y = GameGlobals.SCREEN_HEIGHT;
        }
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
        let ctx = GameGlobals.CTX;

        if(rotation !== undefined) {
            let deg = GMath.toRadians(rotation);

            ctx.save();
            ctx.translate(x + this.width * 0.5, y + this.height * 0.5);
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
        let ctx = GameGlobals.CTX;
        let deg = GMath.toRadians(rotation);

        ctx.save();
        ctx.translate(x + this.width * 0.5, y + this.height * 0.5);
        ctx.rotate(deg);
        ctx.drawImage(this.img, 
                      this.sourceWidth * this.#currentFrame, this.sourceHeight * this.#currentRow, 
                      this.sourceWidth, this.sourceHeight, 
                      -this.width * 0.5, -this.height * 0.5, 
                      this.width, this.height);
        ctx.restore();

        if(GameGlobals.frame % this.#staggerFrames == 0) {
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

    pos = { x : 0, y : 0 };

    constructor() {
        let sprite = GameGlobals.ASSETS.PLAYER_SPRITE;

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.7);
        this.#sprite.createAnimationState('iddle', 0, 0, 0, 10);
        this.#sprite.createAnimationState('startup', 0, 0, 3, 10);
        this.#sprite.createAnimationState('running', 0, 3, 6, 10);
        this.#sprite.createAnimationState('blinking', 0, -1, 0, 7);
        this.#sprite.setAnimationState('iddle');

        this.#isAccelerating = false;

        this.#initSettings();
    }

    #initSettings() {
        let settings = GameGlobals.PLAYER_SETTINGS;

        this.#acceleration = settings.acceleration;
        this.#angle = settings.angle;
        this.#rotation = settings.rotation;
        this.#torque = settings.torque;
        this.#vel = { ...settings.vel };
        this.#maxVel = settings.maxVel;
        this.#maxRotation = settings.maxRotation;
    }

    update() {
        this.#updateFromInput();
        this.#updatePosition();
        this.#updateOrientation();
    }

    draw() {
        this.#sprite.animate(this.pos.x, this.pos.y, this.#angle);
        //this.#visualizeVelocityVector();
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

    #visualizeVelocityVector () {
        let posX = this.pos.x + this.#sprite.width * 0.5;
        let posY = this.pos.y + this.#sprite.height * 0.5;

        GameGlobals.CTX.beginPath();
        GameGlobals.CTX.moveTo(posX, posY);
        GameGlobals.CTX.lineTo(posX + this.#vel.x * 50, posY + this.#vel.y * 50);
        GameGlobals.CTX.lineWidth = 2;
        GameGlobals.CTX.strokeStyle = 'lime';
        GameGlobals.CTX.stroke();
    }

    get vel() { return this.#vel; }
    get rotation() { return this.#rotation; }
    get angle() { return this.#angle; }
    get width() { return this.#sprite.width; }
    get height() { return this.#sprite.height; } 
    get sprite() { return this.#sprite; }
    get isAccelerating() { return this.#isAccelerating; }

}

const DATA = document.getElementById('data');
const GAME = new Game();
const run = () => {
    GAME.update();
    updateData(/*'Frame: ' + GameGlobals.frame +
               '&nbsp;&nbsp;&nbsp;&nbsp;' + */
               'vx: ' + GAME.player.vel.x.toFixed(3) + ' | vy: ' + GAME.player.vel.y.toFixed(3) + 
               '&nbsp;&nbsp;&nbsp;&nbsp;' + 
               'px: ' + GAME.player.pos.x.toFixed(2) + '| py: ' + GAME.player.pos.y.toFixed(2) +
               '&nbsp;&nbsp;&nbsp;&nbsp;' + 
               'a: ' + GAME.player.angle.toFixed(2) + ' r: ' + GAME.player.rotation.toFixed(2));
    GameGlobals.frame++;
    requestAnimationFrame(run);
};

const updateData = (_data) => {
    DATA.innerHTML = _data;
};

run();
