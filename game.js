class GG {

    static CANVAS = document.getElementById('game-canvas');
    static CTX = this.CANVAS.getContext('2d');
    static SCREEN_WIDTH = this.CANVAS.width = window.innerWidth;
    static SCREEN_HEIGHT = this.CANVAS.height = window.innerHeight;
    static SCREEN_CENTER = { x : this.SCREEN_WIDTH * 0.5, y : this.SCREEN_HEIGHT * 0.5 };
    static ASSETS = {
        SPRITES : {
            BACKGROUND :   { src : 'assets/bg.png',               width : 1920, height : 3000, },
            P_BACKGROUND : { src : 'assets/p-bg.png',             width : 1920, height : 3000, },
            P_DUST :       { src : 'assets/p-dust.png',           width : 3000, height : 2300, },
            PLAYER :       { src : 'assets/ship-spritesheet.png', width : 100,  height : 100, },
            PROJECTILE :   { src : 'assets/laser.png',            width : 80,   height : 48, },
            ENEMY_PROJ :   { src : 'assets/enemy-laser.png',      width : 80,   height : 48, },
            SHIELD :       { src : 'assets/shield.png',           width : 128,  height : 128 },
            SHIELD_ICON :  { src : 'assets/shield-icon.png',      width : 64,   height : 64 },
            SHIELD_SPAWN : { src : 'assets/shield-powerup.png',   width : 64,   height : 64 },
            ASTEROIDS :    { src : 'assets/asteroids-s.png',      width : 64,   height : 64,
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
            ENEMIES : { src : 'assets/enemies-2.png', width : 90, height : 74,
                        variations : {
                            1 :  { row : 0, col : 0 },
                            2 :  { row : 0, col : 1 },
                            3 :  { row : 0, col : 2 },
                            4 :  { row : 0, col : 3 },
                            5 :  { row : 0, col : 4 },
                            6 :  { row : 0, col : 5 },
                        }
            },
            EXPLOSIONS : {
                1 : { src : 'assets/explosion1.png', width : 96, height : 96 },
                2 : { src : 'assets/explosion2.png', width : 96, height : 96 },
                3 : { src : 'assets/explosion3.png', width : 96, height : 96 },
                4 : { src : 'assets/explosion4.png', width : 96, height : 96 },
                5 : { src : 'assets/explosion5.png', width : 96, height : 96 },
            },
        }, 
        AUDIO : { 
            music : 'assets/track1.mp3',
            laser : 'assets/laser.mp3',
            playerExplosion : 'assets/explosion.mp3',
            enemyExplosion : 'assets/enemy-explosion.mp3',
            asteroidExplosion : 'assets/asteroid-explosion.mp3',
            shield : 'assets/shield.mp3',
            shieldHit : 'assets/shield-hit.mp3',
            enemy1 : 'assets/aliens1.mp3', 
            enemy2 : 'assets/aliens2.mp3',
            pause : 'assets/beep.mp3',
        },
    };
    static SETTINGS = {
        asteroidPoolSize : 15,
        inittopAsteroidVel : 1,
        initlowAsteroidVel : 0.2,
        topAsteroidVel : 1.5,
        lowAsteroidVel : 0.5,
        asteroidExplosionScale : 2.5,
        asteroidExplosionsPoolSize : 10,
        enemyExplosionsPoolSize : 3,
        showBoxes : false,
        showPlayerVector : false,
        showPos : false,
        showEnemyVectorToPlayer : false,
        enableSound : true,
        antialiasing : true,
        projectilesPoolSize  : 15,
        baseAsteroidScore : 100,
        baseEnemyScore : 200,
        scoreSlope : 0.00000005,
        gameResetTimeout : 3000,
        shieldPowerUpMinInterval : 40000,
        shieldPowerUpMaxInterval : 120000,
        frameRate : 60,
    };
    static PLAYER_SETTINGS = {
        acceleration : 0.04,
        angle : 270,
        rotation : 0,
        torque : 0.35,
        vel : { x : 0, y : 0 },
        maxVel : 3,
        maxRotation : 3,
        projectileSpeed : 25,
        explosionVariation : 4,
        explosionScale : 4,
    };
    static ENEMY_SETTINGS = {
        minWaveNumber : 1,
        maxWaveNumber : 3,
        waveInterval : 10000,
        projectileSpeed : 7,
        minAttackInterval : 3000,
        maxAttackInterval : 8000,
        explosionScale : 4,
    };
    static AUDIO_SETTINGS = {
        musicVolume : 0.6,
        projectileVolume : 0.4,
        enemyVolume : 0.4,
        playerExplosionVolume : 0.6,
        enemyExplosionVolume : 0.8,
        asteroidExplosionVolume : 0.5,
    };

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
        window.addEventListener('keydown', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase() && 
               !this.keys[key]?.locked && !this.keys[key].pressed) {

                this.keys[key].pressed = true;
                callback();
            }
        });
        this.keyUp(key, () => this.keys[key].pressed = false);
    }

    static track(key) {
        this.keys[key] = { pressed : false };
        window.addEventListener('keydown', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase() && 
               !this.keys[key]?.locked && !this.keys[key].pressed) {

                this.keys[key].pressed = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if(e.key.toLowerCase() === key.toLowerCase()) {
                this.keys[key].pressed = false;
            }
        });
    }

    static lock(key) {
        this.keys[key] = { locked : true };
    }

    static unlock(key) {
        this.keys[key] = { locked : false };
    }

}

class Helper {

    /*
    Calculates the new height or width of a sprite while preserving aspect ratio.
    Useful when you want game backgrounds to scale dynamically with monitor size.
    */
    static getNewHeight(originalWidth, originalHeight, newWidth) {
        return (originalHeight / originalWidth) * newWidth;
    }

    static getNewWidth(originalWidth, originalHeight, newHeight) {
        return (originalWidth / originalHeight) * newHeight;
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
    static enemyAlert = document.getElementById('ui-enemy-alert');

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

    static showEnemyAlert() {
        this.enemyAlert.style.display = 'flex';
        TimeoutController.set(() => {
            this.enemyAlert.style.display = 'none';
        }, 6000);
    }

    static getScore() { return parseInt(this.score.innerText); }
    static getRecord() { return parseInt(this.record.innerText); }

}

class Draw {

    static lineColor = 'lime';
    static dotColor = 'lime';
    static boxColor = 'lime';

    static line(v1, v2, color = this.lineColor) {
        GG.CTX.beginPath();
        GG.CTX.moveTo(v1.x, v1.y);
        GG.CTX.lineTo(v2.x, v2.y);
        GG.CTX.strokeStyle = color;
        GG.CTX.stroke();
    }

    static dot(x, y, color = this.dotColor) {
        GG.CTX.beginPath();
        GG.CTX.arc(x, y, 5, 0, 2 * Math.PI);
        GG.CTX.fillStyle = color;
        GG.CTX.fill();
    }

    static box(x,y, w, h, color = this.boxColor) {
        GG.CTX.strokeStyle = color;
        GG.CTX.strokeRect(x, y, w, h);
    }

}

class GAudio {

    static isPlaying(audio) {
        return !audio.paused && !audio.ended && audio.currentTime > 0;
    }

}

class Game {

    #paused;
    #starsBG; #dustBG;
    #player;
    #playerSpriteOffset;
    #renderPlayer;
    #audio;
    #score;
    #record;
    #shieldPowerUp;
    
    constructor() {
        GG.CTX.imageSmoothingEnabled = GG.SETTINGS.antialiasing;
        this.#paused = true;
        this.#score = 0;
        this.#record = 0;

        this.#initBackgrounds();
        this.#initPlayer();
        this.#initObjects();
        this.#initInput();
        this.#initAudio();

        this.#shieldPowerUp = new ShieldPowerUp();
    }

    #initPlayer() {
        this.#player = new Player();
        this.#player.pos.x = GG.SCREEN_CENTER.x;
        this.#player.pos.y = GG.SCREEN_CENTER.y;
        this.#playerSpriteOffset = this.#player.width * 0.5;
        this.#renderPlayer = true;
    }

    #initObjects() {
        ProjectileController.createPool(GG.SETTINGS.projectilesPoolSize);
        AsteroidController.createPool(GG.SETTINGS.asteroidPoolSize);
        EnemyProjectileController.createPool(GG.SETTINGS.projectilesPoolSize);
        ExplosionController.createEnemyExplosionsPool(GG.SETTINGS.enemyExplosionsPoolSize);
        ExplosionController.createAsteroidExplosionsPool(GG.SETTINGS.asteroidExplosionsPoolSize);
    }

    #initInput() {
        Input.once('enter', () => {
            this.#startGame();

            Input.once('p', () => this.pause());
            Input.once('escape', () => this.pause());
            Input.once('r', () => { 
                this.#player.reset({ x : GG.SCREEN_CENTER.x, y : GG.SCREEN_CENTER.y });
            });
            Input.track('w');
            Input.keyUp('w', () => this.#player.stopAccel());
            Input.keyDown('d', () => this.#player.rotateR());
            Input.keyDown('a', () => this.#player.rotateL());
            Input.once(' ', () => {
                if(this.#paused) return;
                this.#player.shoot();
            });
            Input.once('q', () => {
                if(this.#player.shield.active) this.#player.shield.active = false;
                else this.#player.shield.active = true;
            });
            Input.once('m', () => { 
                this.toggleSound();
            });
        });
    }

    #initAudio() {
        let assets = GG.ASSETS.AUDIO;
        let settings = GG.AUDIO_SETTINGS;

        this.#audio = { 
            music : new Audio(assets.music),
            playerExplosion : new Audio(assets.playerExplosion),
            enemy1 : new Audio(assets.enemy1),
            enemy2 : new Audio(assets.enemy2),
            pause : new Audio(assets.pause),
            shieldHit : new Audio(assets.shieldHit),
        };

        this.#audio.enemy1.volume = settings.enemyVolume;
        this.#audio.enemy2.volume = settings.enemyVolume;
        this.#audio.music.volume = settings.musicVolume;

    }

    #initBackgrounds() {
        let starsBG = GG.ASSETS.SPRITES.P_BACKGROUND;
        let dustBG = GG.ASSETS.SPRITES.P_DUST;
        
        //this.#starsBG = new ParallaxBackground(starsBG.src, starsBG.width, starsBG.height, 0.15);
        this.#starsBG = new ParallaxBackground(starsBG.src, 
                                               GG.SCREEN_WIDTH, 
                                               Helper.getNewHeight(starsBG.width, starsBG.height, GG.SCREEN_WIDTH),
                                               0.15);
        this.#dustBG = new ParallaxBackground(dustBG.src, 
                                              GG.SCREEN_WIDTH, 
                                              Helper.getNewHeight(dustBG.width, dustBG.height, GG.SCREEN_WIDTH),
                                              0.25);
    }

    #startGame() {
        this.#paused = false;
        if(GG.SETTINGS.enableSound) {
            this.#audio.music.play();
        }
        DOMUI.hideStartScreen();
        EnemyController.scheduleWave();
        Input.lock('enter');
    }

    update() {
        if(this.#paused) return;

        this.draw();
        ProjectileController.update(); 
        AsteroidController.update(this.#player.hitBox);
        ExplosionController.update();
        EnemyController.update(this.#player.pos);
        EnemyProjectileController.update(this.#player.hitBox);
        TimeoutController.update();

        this.#playerLogic();

        if(AsteroidController.destroyedAsteroidsScales.length > 0) this.#projectileCollidedWithAsteroid();
        if(AsteroidController.collidedWithPlayer) this.#playerCollidedWithAasteroid();
        if(EnemyController.destroyedEnemies > 0) this.#playerKilledEnemy();
        if(EnemyProjectileController.playerHit) this.#enemyHitPlayer();

        if(GG.SETTINGS.enableSound) {
            if(EnemyController.enemies.length > 0 && !GAudio.isPlaying(this.#audio.enemy1)) {
                this.#audio.enemy1.play();
            } else if (EnemyController.enemies.length === 0 && GAudio.isPlaying(this.#audio.enemy1)) {
                this.#audio.enemy1.pause();
                this.#audio.enemy1.currentTime = 0;
            }
        }

        GG.frame++;
    }

    draw() {
        GG.CTX.clearRect(0, 0, GG.SCREEN_WIDTH, GG.SCREEN_HEIGHT);
        this.#starsBG.update();
        this.#dustBG.update();
        this.#shieldPowerUp.draw();
    }

    pause() {
        this.#audio.pause.play();

        if(this.#paused) {
            this.#paused = false;
            Input.unlock('m');
            if(GG.SETTINGS.enableSound) this.resumeSound();
            TimeoutController.resumeAll();
        } else {
            this.#paused = true;
            Input.lock('m');
            this.pauseSound();
            TimeoutController.pauseAll();
        }

        DOMUI.togglePause(this.#paused);
    }

    pauseSound() {
        this.#audio.music.pause();
        if(GAudio.isPlaying(this.#audio.enemy1) || GAudio.isPlaying(this.#audio.enemy2)) {
            this.#audio.enemy1.pause();
            this.#audio.enemy2.pause();
        }
        if(this.#player.shield.active) this.#player.shield.audio.pause();
    }

    resumeSound() {
        this.#audio.music.play(); 
        if(EnemyController.enemies.length > 0) {
            this.#audio.enemy1.play();
            this.#audio.enemy2.play();
        }
        if(this.#player.shield.active) this.#player.shield.audio.play();
    }

    toggleSound() {
        if(GAudio.isPlaying(this.#audio.music)) {
            this.pauseSound();
            GG.SETTINGS.enableSound = false;
        } else {
            this.resumeSound();
            GG.SETTINGS.enableSound = true;
        }
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
    }

    #enemyHitPlayer() {
        if(this.#player.isInvulnerable) return;
        if(this.#player.shield.active) {
            this.#player.shield.sprite.setAnimationState('hit');
            this.#audio.shieldHit.play();
            TimeoutController.set(() => this.#player.shield.sprite.setAnimationState('iddle'), 200);
        } else {
            this.#playerDestroyed();
        }
    }

    #projectileCollidedWithAsteroid() {
        for(let i = 0; i < AsteroidController.destroyedAsteroidsScales.length; i++) {
            let asteroidScale = AsteroidController.destroyedAsteroidsScales[i];
            this.#score += GG.SETTINGS.baseAsteroidScore - asteroidScale;
            DOMUI.updateScore(this.#score);
        }
        AsteroidController.destroyedAsteroidsScales = [];
    }

    #playerKilledEnemy() {
        for(let i = 0; i < EnemyController.destroyedEnemies; i++) {
            this.#score += GG.SETTINGS.baseEnemyScore;
            DOMUI.updateScore(this.#score);
        }
        EnemyController.destroyedEnemies = 0;
    }

    #playerCollidedWithAasteroid() {
        if(this.#player.isInvulnerable) return;
        if(this.#player.shield.active) {
            this.#player.shield.sprite.setAnimationState('hit');
            TimeoutController.set(() => this.#player.shield.sprite.setAnimationState('iddle'), 200);
        } else {
            this.#playerDestroyed();
        }
        AsteroidController.destroyAndRespawnAsteroid(AsteroidController.lastAsteroidToHitPlayer);
    }

    #playerDestroyed() {
        if(GG.SETTINGS.enableSound) this.#audio.playerExplosion.play();
        this.#player.isInvulnerable = true;
        this.#player.ableToShoot = false;
        this.#renderPlayer = false;
        ExplosionController.explodePlayer(this.#player.pos);
        
        TimeoutController.set(() => {
            this.#initObjects();
            this.#renderPlayer = true;
            this.#player.isInvulnerable = false;
            this.#player.reset({ x : GG.SCREEN_CENTER.x, y : GG.SCREEN_CENTER.y });
            this.#resetScore();
            EnemyController.resetEnemies();
            EnemyProjectileController.resetAll();
        }, GG.SETTINGS.gameResetTimeout);
    }

    #resetScore() {
        if(this.#score > this.#record) this.#record = this.#score;
        this.#score = 0;
        DOMUI.updateScore(0);
        DOMUI.updateRecord(this.#record);
    }

    get player() { return this.#player; }

}

class ParallaxBackground {

    #img;
    #width;
    #height;
    #rate;
    #x1; #y1; #x2; #y2;

    constructor(src, w, h, rate) {
        this.#img = new Image();
        this.#img.src = src;
        this.#width = w;
        this.#height= h;
        this.#rate = rate || 1;
        this.#x1 = this.#x2 = 0;
        this.#y1 = 0;
        this.#y2 = this.#y1 - this.#height;
    }

    update() {
        this.draw();
        if(this.#y1 > GG.SCREEN_HEIGHT) this.#y1 = this.#y2 - this.#height;
        else this.#y1 += this.#rate;
        
        if(this.#y2 > GG.SCREEN_HEIGHT) this.#y2 = this.#y1 - this.#height;
        else this.#y2 += this.#rate;
    }

    draw() {
        GG.CTX.drawImage(this.#img, this.#x1, this.#y1, this.#width, this.#height);
        GG.CTX.drawImage(this.#img, this.#x2, this.#y2, this.#width, this.#height);
    }

    set rate(val) { 
        if (typeof val !== 'number') return; 
        this.#rate = val; 
    }

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
        ctx.drawImage(this.#img, x, y, this.#width, this.#height);
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
        if (typeof scale !== 'number') return; 
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
                    this.#animationDone = true; 
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

    reset() {
        this.#startFrame = 0;
        this.#currentRow = 0;
        this.#currentFrame = this.#startFrame;
        this.#animationDone = false;
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
    #hitBox;
    #isInvulnerable;
    #pos;
    #shield;
    #ableToShoot;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.PLAYER;

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.8);
        this.#sprite.createAnimationState('iddle', 0, 0, 0, 10);
        this.#sprite.createAnimationState('running', 0, 3, 6, 10);
        this.#sprite.createAnimationState('blinking', 0, -1, 0, 7);
        this.#sprite.setAnimationState('iddle');
        this.#initSettings();
        this.#hitBox = new HitBox(this.pos.x, this.pos.y, 
                                  this.#sprite.width, this.#sprite.height,
                                  0.7);
        this.#shield = new Shield();
    }

    update() {
        this.#updateFromInput();
        this.#updatePosition();
        this.#updateOrientation();
        this.#hitBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                               this.pos.y - this.#sprite.height * 0.5);
        this.#shield.pos = this.#pos;
        this.draw();
    }

    draw() {
        this.#sprite.animateRow(this.pos.x, this.pos.y, this.#angle);
        this.#shield.draw();
        if(GG.SETTINGS.showPlayerVector) this.#visualizeVelocityVector();
        if(GG.SETTINGS.showPos) Draw.dot(this.pos.x, this.pos.y);
        if(GG.SETTINGS.showBoxes) this.#hitBox.draw();
    }

    shoot() {
        if(!this.#ableToShoot) return;
        ProjectileController.shoot(this.#pos, this.#angle, this.#vel);
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
        this.#ableToShoot = true;
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

    reset(_pos) {
        let settings = GG.PLAYER_SETTINGS;

        if(_pos != 'undefined') this.#pos = _pos;
        else this.#pos = { x : 0, y : 0 };
        
        this.sprite.setAnimationState('blinking');
        this.#angle = settings.angle;
        this.#rotation = settings.rotation;
        this.#vel = { ...settings.vel };
        this.#isAccelerating = false;
        this.#ableToShoot = true;

        TimeoutController.set(() => {
            this.sprite.setAnimationState('iddle');
        }, 1000);
    }

    #visualizeVelocityVector(scale = 50) {
        Draw.line(this.pos, { x : this.pos.x + this.#vel.x * scale, y : this.pos.y + this.#vel.y * scale });
    }

    get pos() { return this.#pos; }
    get vel() { return this.#vel; }
    get rotation() { return this.#rotation; }
    get angle() { return this.#angle; }
    get width() { return this.#sprite.width; }
    get height() { return this.#sprite.height; } 
    get sprite() { return this.#sprite; }
    get isAccelerating() { return this.#isAccelerating; }
    get hitBox() { return this.#hitBox; }
    get isInvulnerable() { return this.#isInvulnerable; }
    get shield() { return this.#shield; }
    get ableToShoot() { return this.#ableToShoot; }

    set pos(pos) {
        if (typeof pos !== 'object' || pos === null) {
            throw new TypeError('Position must be a non-null object');
        }
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            throw new TypeError('Position object must contain numeric properties x and y');
        }
        this.#pos = pos; 
    }
    set isInvulnerable(val) {
        if(val !== true && val !== false) return;
        this.#isInvulnerable = val;
    }
    set ableToShoot(val) {
        if(val !== true && val !== false) return;
        this.#ableToShoot = val;
    }

}

class Projectile {

    #pos;
    #angle;
    #vel;
    #speed;
    #sprite;
    #sound;
    #enableAudio;
    #hitBox;

    constructor(enableAudio = true) {
        let sprite = GG.ASSETS.SPRITES.PROJECTILE;

        this.#enableAudio = enableAudio;
        this.#speed = GG.PLAYER_SETTINGS.projectileSpeed;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, 0.5);
        if(this.#enableAudio) {
            this.#sound = new Audio();
            this.#sound.src = GG.ASSETS.AUDIO.laser;
            this.#sound.volume = GG.AUDIO_SETTINGS.projectileVolume;
        }
    }

    init(pos, a, pv) {
        this.#pos = { x : pos.x || 0, y : pos.y || 0 };
        this.#angle = a || 0;
        this.#vel = { 
            x : Math.cos(GMath.toRadians(this.#angle)) * this.#speed + pv.x, 
            y : Math.sin(GMath.toRadians(this.#angle)) * this.#speed + pv.y, 
        }
        this.#hitBox = new HitBox(this.#pos.x - this.#sprite.width * 0.5, 
                                  this.#pos.y - this.#sprite.height * 0.5, 
                                  this.#sprite.width, this.#sprite.height,
                                  0.5);
        if(GG.SETTINGS.enableSound && this.#enableAudio) this.#sound.play();
    }

    update() {
        this.#pos.x += this.#vel.x;
        this.#pos.y += this.#vel.y;

        this.#hitBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                               this.pos.y - this.#sprite.height * 0.5);
    }

    draw() {
        this.#sprite.draw(this.pos.x, this.pos.y, this.#angle);
        if(GG.SETTINGS.showBoxes) this.#hitBox.draw();
    }

    playSound() {
        if(GG.SETTINGS.enableSound) this.#sound.play();
    }

    get hitBox() { return this.#hitBox; }
    get sprite() { return this.#sprite; }
    get pos() { return this.#pos; }
    get speed() { return this.#speed; }

    set sprite(sprite) {
        if(!(sprite instanceof Sprite)) return;
        this.#sprite = sprite;
    }
    set speed(speed) {
        this.#speed = speed;
    }

}

class ProjectileController {

    static inactiveProjectiles = [];
    static activeProjectiles = [];

    static update() {
        let toBeRemoved = [];
        
        for(let i = 0; i < this.activeProjectiles.length; i++) {
            let p = this.activeProjectiles[i];

            if(p.pos.x > GG.SCREEN_WIDTH || p.pos.y > GG.SCREEN_HEIGHT ||
               p.pos.x < 0 || p.pos.y < 0) {
                toBeRemoved.push(p);
            } else {
                p.update();
                p.draw();
                for(let j = 0; j < AsteroidController.asteroids.length; j++) {
                    let a = AsteroidController.asteroids[j];

                    if(p.hitBox.SATCollides(a.hitBox)) {
                        toBeRemoved.push(p);
                        AsteroidController.destroyedAsteroidsScales.push(a.sprite.scale);
                        ExplosionController.explodeAsteroid(a.pos, a.sprite.scale * GG.SETTINGS.asteroidExplosionScale);
                        AsteroidController.respawn(a);
                    }
                }
                for(let j = 0; j < EnemyController.enemies.length; j++) {
                    let en = EnemyController.enemies[j];

                    if(p.hitBox.SATCollides(en.hitBox)) {
                        toBeRemoved.push(p);
                        EnemyController.destroyedEnemies++;
                        ExplosionController.explodeEnemy(en.pos);
                        EnemyController.enemies.splice(j, 1);
                        j--;
                    }
                }
                
            }
        }

        for(let i = 0; i < toBeRemoved.length; i++) {
            let p = toBeRemoved[i];

            this.reset(p);
        }

        this.activeProjectiles = this.activeProjectiles.filter(
            (p) => !toBeRemoved.includes(p)
        );
    }

    static createPool(number) {
        for(let i = 0; i < number; i++) {
            this.inactiveProjectiles[i] = new Projectile();
        }
    }

    static shoot(pos, a, pv) {
        let p = this.inactiveProjectiles.pop();

        p.init(pos, a, pv);
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
    #hitBox;

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
        this.#hitBox = new HitBox(this.#pos.x - this.#sprite.width * 0.5, 
                                  this.#pos.y - this.#sprite.height * 0.5, 
                                  this.#sprite.width, this.#sprite.height,
                                  0.8);
    }

    update() {
        this.#pos.x += this.#vel.x;
        this.#pos.y += this.#vel.y;

        this.#hitBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                               this.pos.y - this.#sprite.height * 0.5);

        if(this.#angle < 0 ) this.#angle = 360;
        else if(this.#angle > 360) this.#angle = 0;
        else this.#angle += this.#rotation;
    }

    draw() {
        this.#sprite.drawFromSheet(this.#pos.x, this.#pos.y, 
                                   this.#variations[this.#variation].row,
                                   this.#variations[this.#variation].col, this.#angle);
        if(GG.SETTINGS.showBoxes) this.#hitBox.draw();
        if(GG.SETTINGS.showPos) Draw.dot(this.#pos.x, this.#pos.y);
    }

    get pos() { return this.#pos; }
    get vel() { return this.#vel; }
    get sprite() { return this.#sprite; }
    get hitBox() { return this.#hitBox; }

    set pos(pos) { 
        if (typeof pos !== 'object' || pos === null) {
            throw new TypeError('Position must be a non-null object');
        }
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            throw new TypeError('Position object must contain numeric properties x and y');
        }
        this.#pos = pos; 
    }
    set vel(vel) { 
        if (typeof vel !== 'object' || vel === null) {
            throw new TypeError('Velocity must be a non-null object');
        }
        if (typeof vel.x !== 'number' || typeof vel.y !== 'number') {
            throw new TypeError('Velocity object must contain numeric properties x and y');
        }
        this.#vel = vel;
    }
    set rotation(val) { 
        if (typeof val !== 'number') throw new TypeError('Rotation must be a number');
        this.#rotation = val; 
    }

}

class AsteroidController {

    static asteroids = [];
    static maxScale = 1.9;
    static minScale = 0.5;
    static collidedWithPlayer = false;
    static destroyedAsteroidsScales = [];
    static lastAsteroidToHitPlayer = undefined;
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

    static update(playerHitBox = undefined) {
        if(this.collidedWithPlayer) this.collidedWithPlayer = false;

        if(this.asteroids.length < GG.SETTINGS.asteroidPoolSize) {
            this.asteroids.push(this.createRandom());
        }

        for(let i = 0; i < this.asteroids.length; i++) {
            let a = this.asteroids[i];

            a.update();
            a.draw();

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
            if(playerHitBox instanceof HitBox) {
                if(a.hitBox.SATCollides(playerHitBox)) {
                    this.collidedWithPlayer = true;
                    this.lastAsteroidToHitPlayer = a;
                }
            }
        }
    }

    static createPool(number) {
        if(this.asteroids.length > 0) this.asteroids = [];
        for(let i = 0; i < number; i++) {
            this.asteroids[i] = this.createRandom();
        }
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
                vx = GMath.randomFloat(-st.lowAsteroidVel, st.lowAsteroidVel);
                vy = GMath.randomFloat(st.lowAsteroidVel, st.topAsteroidVel);
                break;
            case 1 :
                vx = GMath.randomFloat(-st.lowAsteroidVel, -st.topAsteroidVel);
                vy = GMath.randomFloat(-st.lowAsteroidVel, st.lowAsteroidVel);
                break;
            case 2 :
                vx = GMath.randomFloat(-st.lowAsteroidVel, st.lowAsteroidVel);
                vy = GMath.randomFloat(-st.lowAsteroidVel, -st.topAsteroidVel);
                break;
            case 3 :
                vx = GMath.randomFloat(st.lowAsteroidVel, st.topAsteroidVel);
                vy = GMath.randomFloat(-st.lowAsteroidVel, st.lowAsteroidVel);
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

    static destroyAndRespawnAsteroid(a) {
        ExplosionController.explodeAsteroid(a.pos, a.sprite.scale * GG.SETTINGS.asteroidExplosionScale);
        AsteroidController.respawn(a);
    }

}

class HitBox {

    #originalWidth;
    #originalHeight;
    #width; 
    #height;
    #scale
    x; y; 

    constructor(x, y, w, h, scale) {
        this.#originalWidth = w;
        this.#originalHeight = h;
        this.#scale = scale || 1;
        this.#width = w * this.#scale;
        this.#height = h * this.#scale;
        this.x = x + (this.#originalWidth - this.#width) * 0.5;
        this.y = y + (this.#originalHeight - this.#height) * 0.5;
    }

    translate(x, y) {
        this.x = x + (this.#originalWidth - this.#width) * 0.5;
        this.y = y + (this.#originalHeight - this.#height) * 0.5;
    }

    SATCollides(box) {
        if(!(box instanceof HitBox)) return;
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
        if(!(box instanceof HitBox)) return;
        if(this.x + this.#width >= box.x &&
           this.x <= box.x + box.width &&
           this.y + this.#height >= box.y &&
           this.y <= box.y + box.height) {

            return true;
        }
        return false;
    }

    draw() {
        Draw.box(this.x, this.y, this.#width, this.#height);
    }

    get width() { return this.#width; }
    get height() { return this.#height; }

}

class Explosion {

    #x; #y;
    #sprite;
    #rotation;
    #sound;

    constructor(x, y, scale, _variation, soundSrc) {
        let variation = _variation || GMath.randomInt(1, 3);
        let sprite = GG.ASSETS.SPRITES.EXPLOSIONS[variation];

        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, scale || 1, 1, 64, 8, 8, true);
        this.#x = x;
        this.#y = y;
        this.#rotation = GMath.randomInt(1, 360);
        if(soundSrc) this.#sound = new Audio(soundSrc);
        else this.#sound = undefined;
    }

    update() {}

    draw() {
        this.#sprite.animate(this.#x, this.#y, this.#rotation);
    }

    reset() {
        this.#sprite.reset();
    }

    get sprite() { return this.#sprite; }
    get sound() { return this.#sound; }
    get animationDone() { return this.#sprite.animationDone; }
    get sound() { return this.#sound; }

    set x(x) {
        if(typeof x !== 'number') {
            throw new TypeError('X must be a number');
        }
        this.#x = x;
    } 
    set y(y) {
        if(typeof y !== 'number') {
            throw new TypeError('Y must be a number');
        }
        this.#y = y;
    }

}

class EnemyExplosion extends Explosion {

    constructor(x, y) {
        super(x, y, GG.ENEMY_SETTINGS.explosionScale, 5, GG.ASSETS.AUDIO.enemyExplosion);
        this.sound.volume = GG.AUDIO_SETTINGS.enemyExplosionVolume;
    }

}

class PlayerExplosion extends Explosion {

    active;

    constructor(x, y) {
        super(x, y, GG.PLAYER_SETTINGS.explosionScale, 
              GG.PLAYER_SETTINGS.explosionVariation, 
              GG.ASSETS.AUDIO.playerExplosion);
        this.active = false;
    }

}

class ExplosionController {

    static inactiveAsteroidExplosions = [];
    static activeAsteroidExplosions = [];
    static inactiveEnemyExplosions = [];
    static activeEnemyExplosions = [];
    static _playerExplosion = new PlayerExplosion(0, 0);

    static createAsteroidExplosionsPool(number) {
        for(let i = 0; i < number; i++) {
            let ex = new Explosion(0, 0, 1, undefined, GG.ASSETS.AUDIO.asteroidExplosion);

            ex.sound.volume = GG.AUDIO_SETTINGS.asteroidExplosionVolume;
            this.inactiveAsteroidExplosions.push(ex);
        }
    }

    static createEnemyExplosionsPool(number) {
        for(let i = 0; i < number; i++) {
            this.inactiveEnemyExplosions.push(new EnemyExplosion(0, 0));
        }
    }

    static update() {
        if(this._playerExplosion.active) {
            this._playerExplosion.draw();
            if(this._playerExplosion.animationDone) {
                this._playerExplosion.active = false;
                this._playerExplosion.sprite.reset();
            }
        }

        for(let i = 0; i < this.activeAsteroidExplosions.length; i++) {
            let e = this.activeAsteroidExplosions[i];
            
            e.draw();
            if(e.animationDone) {
                e.reset();
                this.inactiveAsteroidExplosions.unshift(e);
                this.activeAsteroidExplosions.splice(i, 1);
            }
        }

        for(let i = 0; i < this.activeEnemyExplosions.length; i++) {
            let e = this.activeEnemyExplosions[i];
            
            e.draw();
            if(e.sprite.animationDone) {
                e.reset();
                this.inactiveEnemyExplosions.unshift(e);
                this.activeEnemyExplosions.splice(i, 1);
            }
        }
    }

    static explodeAsteroid(pos, scale) {
        let exp = this.inactiveAsteroidExplosions.pop();

        exp.sprite.scale = scale;
        exp.x = pos.x;
        exp.y = pos.y;
        if (exp.sound && GG.SETTINGS.enableSound) exp.sound.play();
        this.activeAsteroidExplosions.push(exp);
    }

    static explodeEnemy(pos) {
        let exp = this.inactiveEnemyExplosions.pop();

        exp.x = pos.x;
        exp.y = pos.y;
        if (exp.sound && GG.SETTINGS.enableSound) exp.sound.play();
        this.activeEnemyExplosions.push(exp);
    }

    static explodePlayer(pos) {
        let exp = this._playerExplosion;

        exp.active = true;
        exp.x = pos.x;
        exp.y = pos.y;
        if(exp.sound && GG.SETTINGS.enableSound) exp.sound.play();
    }

}

class Enemy {

    #vel;
    #pos;
    #sprite;
    #angle;
    #variations;
    #variation;
    #scale;
    #hitBox;
    #attackInterval;
    #lastAttackTime;

    constructor(pos, vel, scale, variation) {
        let sprite = GG.ASSETS.SPRITES.ENEMIES;
        
        this.#scale = scale || 1;
        this.#sprite = new Sprite(sprite.src, sprite.width, sprite.height, this.#scale);
        this.#pos = pos;
        this.#vel = vel;
        this.#angle = 0;
        this.#attackInterval = GMath.randomInt(GG.ENEMY_SETTINGS.minAttackInterval, 
                                               GG.ENEMY_SETTINGS.maxAttackInterval);
        this.#lastAttackTime = performance.now();
        this.#variations = sprite.variations;
        this.#variation = variation || GMath.randomInt(1, Object.keys(sprite.variations).length);
        this.#hitBox = new HitBox(this.#pos.x - this.#sprite.width * 0.5, 
                                  this.#pos.y - this.#sprite.height * 0.5, 
                                  this.#sprite.width, this.#sprite.height,
                                  0.8);
    }

    update(playerPos) {
        this.draw();
        this.#pos.x += this.#vel.x;
        this.#pos.y += this.#vel.y;
        this.#hitBox.translate(this.pos.x - this.#sprite.width * 0.5, 
                               this.pos.y - this.#sprite.height * 0.5);
        this.#angle = GMath.pointsAngleD(this.#pos.x, this.#pos.y, playerPos.x, playerPos.y);
    }

    draw() {
        this.#sprite.drawFromSheet(this.#pos.x, this.#pos.y,
                                   this.#variations[this.#variation].row,
                                   this.#variations[this.#variation].col, this.#angle - 90);
        if(GG.SETTINGS.showPos) Draw.dot(this.pos.x, this.pos.y);
        if(GG.SETTINGS.showBoxes) this.#hitBox.draw();
    }

    shoot() {
        EnemyProjectileController.shoot(this.#pos, this.#angle, this.#vel);
    }

    get vel() { return this.#vel; }
    get pos() { return this.#pos; }
    get angle() { return this.#angle; }
    get attackInterval() { return this.#attackInterval; }
    get lastAttackTime() { return this.#lastAttackTime; }
    get sprite() { return this.#sprite; }
    get hitBox() { return this.#hitBox; }

    set vel(vel) { 
        if (typeof vel !== 'object' || vel === null) {
            throw new TypeError('Velocity must be a non-null object');
        }
        if (typeof vel.x !== 'number' || typeof vel.y !== 'number') {
            throw new TypeError('Velocity object must contain numeric properties x and y');
        }
        this.#vel = vel;
    }
    set pos(pos) {
        if (typeof pos !== 'object' || pos === null) {
            throw new TypeError('Position must be a non-null object');
        }
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            throw new TypeError('Position object must contain numeric properties x and y');
        }
        this.#pos = pos;
    }
    set angle(a) { 
        if (typeof a !== 'number') return;
        a = a % 360;
        if (a < 0) a += 360;
        this.#angle = a; 
    }
    set lastAttackTime(t) {
        if(typeof t !== 'number') return;
        this.#lastAttackTime = t;
    }

}

class EnemyController {

    static enemies = [];
    static inactive = [];
    static offScreenSpawnOffset = -50;
    static waveScheduled = false;
    static destroyedEnemies = 0;

    static createWave(_number, reset) {
        let number = _number || GG.ENEMY_SETTINGS.minWaveNumber;

        if(reset) this.resetEnemies();

        for(let i = 0; i < number; i++) {
            this.enemies.push(this.createRandom());
        }
    }

    static createRandom() {
        let pos = { x : GMath.randomInt(GG.SCREEN_WIDTH * 0.1, GG.SCREEN_WIDTH * 0.9), 
                    y : this.offScreenSpawnOffset };
        let vel = { x : GMath.randomFloat(-0.2, 0.2), 
                    y : GMath.randomFloat(0.3, 1) };
        return new Enemy(pos, vel);
    }

    static update(playerPos) {
        if(this.waveScheduled) return;
        if(this.enemies.length === 0) {
            this.scheduleWave();
            return;
        }

        for(let i = 0; i < this.enemies.length; i++) {
            let en = this.enemies[i];
            let currentTime = performance.now();
            let elapsedTime = currentTime - en.lastAttackTime;

            if(en.pos.x > GG.SCREEN_WIDTH + en.sprite.width) {
                en.pos.x = 0 - en.sprite.width;
            } else if (en.pos.x  < 0 - en.sprite.width) {
                en.pos.x = GG.SCREEN_WIDTH + en.sprite.width;
            }
            if(en.pos.y > GG.SCREEN_HEIGHT +  en.sprite.width) {
                en.pos.y = 0 -  en.sprite.height;
            } else if (en.pos.y < 0 - en.sprite.height) {
                en.pos.y = GG.SCREEN_HEIGHT + en.sprite.width;
            }
            if (elapsedTime >= en.attackInterval) {
                en.shoot();
                en.lastAttackTime = currentTime;
            }
            if(GG.SETTINGS.showEnemyVectorToPlayer) Draw.line(playerPos, en.pos);
            en.update(playerPos);
        }
    }

    static scheduleWave(_time, _number) {
        if(!(GG.ENEMY_SETTINGS.minWaveNumber > 0 && GG.ENEMY_SETTINGS.maxWaveNumber > 0)) return;

        let time = _time || GMath.randomInt(GG.ENEMY_SETTINGS.waveInterval, 
                                            GG.ENEMY_SETTINGS.waveInterval * 2);
        let number = _number || GMath.randomInt(GG.ENEMY_SETTINGS.minWaveNumber,
                                                GG.ENEMY_SETTINGS.maxWaveNumber);

        this.waveScheduled = true;
        this.destroyedEnemies = 0;
        TimeoutController.set(() => {
            this.createWave(number);
            this.waveScheduled = false;
            DOMUI.showEnemyAlert();
        }, time);
    }

    static resetEnemies() {
        this.enemies = [];
        this.destroyedEnemies = 0;
    }

}

class EnemyProjectile extends Projectile {

    constructor() {
        super(false);
        let sprite = GG.ASSETS.SPRITES.ENEMY_PROJ;

        this.speed = GG.ENEMY_SETTINGS.projectileSpeed;
        this.sprite = new Sprite(sprite.src, sprite.width, sprite.height, 0.5);
    }

}

class EnemyProjectileController {

    static inactiveProjectiles = [];
    static activeProjectiles = [];
    static playerHit = false;

    static update(hitBox = undefined) {
        let toBeRemoved = [];
        this.playerHit = false;
        
        for(let i = 0; i < this.activeProjectiles.length; i++) {
            let p = this.activeProjectiles[i];

            if(p.pos.x > GG.SCREEN_WIDTH || p.pos.y > GG.SCREEN_HEIGHT ||
               p.pos.x < 0 || p.pos.y < 0) {
                toBeRemoved.push(p);
            } else {
                p.update();
                p.draw();
                if(hitBox instanceof HitBox) {
                    if(p.hitBox.SATCollides(hitBox)) {
                        this.playerHit = true;
                        toBeRemoved.push(p);
                    }
                }
            }
        }

        for(let i = 0; i < toBeRemoved.length; i++) {
            let p = toBeRemoved[i];
            this.reset(p);
        }

        this.activeProjectiles = this.activeProjectiles.filter(
            (p) => !toBeRemoved.includes(p)
        );
    }

    static createPool(number) {
        for(let i = 0; i < number; i++) {
            this.inactiveProjectiles[i] = new EnemyProjectile();
        }
    }

    static shoot(pos, a, pv) {
        let p = this.inactiveProjectiles.pop();
        p.init(pos, a, pv);
        this.activeProjectiles.push(p);
    }

    static reset(projectile) {
        if(!(projectile instanceof EnemyProjectile)) return;
        this.inactiveProjectiles.unshift(projectile);
    }

    static resetAll() {
        while (this.activeProjectiles.length > 0) {
            let p = this.activeProjectiles.pop();
            this.inactiveProjectiles.push(p);
        }
    }

}

class Timeout {

    id;
    delay;
    start;
    remaining;
    callback;
    paused;
    done;

    constructor(callback, delay) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback Parameter is not a function');
        }

        this.callback = callback;
        this.delay = delay;
        this.remaining = this.delay;
        this.paused = false;
        this.done = false;
        this.#startTimeout();
    }

    #startTimeout() {
        this.start = Date.now();
        this.id = setTimeout(() => { 
            this.callback(); 
            this.done = true;
        }, this.remaining);
    }

    resume() {
        if(!this.paused || this.done) return;

        this.paused = false;
        this.#startTimeout();
    }

    pause() {
        this.paused = true;
        clearTimeout(this.id);
        this.remaining -= Date.now() - this.start; 
    }

    clear() {
        clearTimeout(this.id);
        this.done = true;
    }

}

class TimeoutController {

    static timeouts = [];

    static set(callback, delay) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback Parameter is not a function');
        }

        this.timeouts.push(new Timeout(callback, delay));
    }

    static pauseAll() {
        for(let i = 0; i < this.timeouts.length; i++) {
            this.timeouts[i].pause();
        }
    }

    static resumeAll() {
        for(let i = 0; i < this.timeouts.length; i++) {
            this.timeouts[i].resume();
        }
    }

    static clearAll() {
        for(let i = 0; i < this.timeouts.length; i++) {
            this.timeouts[i].clear();
        }
    }

    static update() {
        for(let i = 0; i < this.timeouts.length; i++) {
            if(this.timeouts[i].done) {
                this.timeouts.splice(i, 1);
                i--;
            }
        }
    }

}

class Shield {

    #pos;
    #sprite;
    #active;
    #audio;

    constructor(pos) {
        let sprite = GG.ASSETS.SPRITES.SHIELD;

        this.#pos = pos || { x : 0, y : 0 };
        this.#sprite = new AnimatedSprite(sprite.src, sprite.width, sprite.height, 0.7, 2, 2, 2, 1, false);
        this.#active = false;
        this.#sprite.createAnimationState('iddle', 0, 0, 1, 2);
        this.#sprite.createAnimationState('hit', 1, 0, 1, 2);
        this.#sprite.setAnimationState('iddle');
        this.#audio = new Audio(GG.ASSETS.AUDIO.shield);
        this.#audio.loop = true;
    }

    update() {}

    draw() {
        if(!this.#active) return;
        this.#sprite.animateRow(this.#pos.x, this.#pos.y, 0);
    }

    set pos(pos) {
        if (typeof pos !== 'object' || pos === null) {
            throw new TypeError('Position must be a non-null object');
        }
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            throw new TypeError('Position object must contain numeric properties x and y');
        }
        this.#pos = pos; 
    }

    set active(val) {
        if(val !== true && val !== false) return;

        if(val) {
            if(!GAudio.isPlaying(this.#audio) && GG.SETTINGS.enableSound) this.#audio.play();
        } else {
            if(GAudio.isPlaying(this.#audio)) this.#audio.pause();
        }

        this.#active = val;
    }

    get active() { return this.#active; }
    get pos() { return this.#pos; }
    get sprite() { return this.#sprite; }
    get audio() { return this.#audio; }

}

class ShieldPowerUp {

    #icon;
    #spawnIcon;
    #spawnInterval;
    #spawnPos;

    constructor() {
        let sprite = GG.ASSETS.SPRITES.SHIELD_ICON;
        let spawnIcon = GG.ASSETS.SPRITES.SHIELD_SPAWN;

        this.#icon = new Sprite(sprite.src, sprite.width, sprite.height, 0.4);
        this.#spawnIcon = new Sprite(spawnIcon.src, spawnIcon.width, spawnIcon.height, 1);
    }

    update() {}

    draw() {
    }

}

const GAME = new Game();
const FPS = GG.SETTINGS.frameRate;
const FRAME_DURATION = 1000 / FPS;
let lastTime = 0;

const run = (timestamp) => {

    if (timestamp - lastTime >= FRAME_DURATION) {
        lastTime = timestamp;
        GAME.update();
    }
    requestAnimationFrame(run);
};

requestAnimationFrame(run);