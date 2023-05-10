import * as PIXI from "https://cdn.skypack.dev/pixi.js@5.x";
import { KawaseBlurFilter } from "https://cdn.skypack.dev/@pixi/filter-kawase-blur@3.2.0";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@3.0.0";


function random(min, max) {
    return Math.random() * (max - min) + min;
}

function map(n, start1, end1, start2, end2) {
    return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

const simplex = new SimplexNoise();

class ColorPalette {
    constructor() {
        this.setColors();
        this.setProperties();
    }

    setColors() {
        this.baseColor = "#3a3a57";

        this.colorChoices = [
            this.baseColor,
        ];
    }

    getColor() {
        return this.colorChoices[0].replace(
            "#",
            "0x"
        );
    }

    setProperties() {
        document.documentElement.style.setProperty("--hue", this.hue);
        document.documentElement.style.setProperty(
            "--hue-complimentary1",
            this.complimentaryHue1
        );
        document.documentElement.style.setProperty(
            "--hue-complimentary2",
            this.complimentaryHue2
        );
    }
}

class Orb {

    constructor(fill = 0x000000) {

        this.bounds = this.setBounds();
        this.x = random(this.bounds["x"].min, this.bounds["x"].max);
        this.y = random(this.bounds["y"].min, this.bounds["y"].max);

        this.scale = 1;

        this.fill = fill;

        this.radius = random(window.innerHeight / 1, window.innerHeight / 3);

        this.xOff = random(0, 1000);
        this.yOff = random(0, 1000);

        this.inc = 0.002;

        this.graphics = new PIXI.Graphics();
        this.graphics.alpha = 0.1;

    }

    setBounds() {
        const maxDist =
            window.innerWidth < 1000 ? window.innerWidth / 3 : window.innerWidth / 5;
        const originX = window.innerWidth / 1.25;
        const originY =
            window.innerWidth < 1000
                ? window.innerHeight
                : window.innerHeight / 1.375;

        return {
            x: {
                min: originX - maxDist,
                max: originX + maxDist
            },
            y: {
                min: originY - maxDist,
                max: originY + maxDist
            }
        };
    }

    update() {
        const xNoise = simplex.noise2D(this.xOff, this.xOff);
        const yNoise = simplex.noise2D(this.yOff, this.yOff);
        const scaleNoise = simplex.noise2D(this.xOff, this.yOff);

        this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
        this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);

        this.scale = map(scaleNoise, -1, 1, 0.3, 1);

        this.xOff += this.inc;
        this.yOff += this.inc;
    }

    render() {
        this.graphics.x = this.x / 5;
        this.graphics.y = this.y;
        this.graphics.scale.set(this.scale * 2);

        this.graphics.clear();

        this.graphics.beginFill(this.fill);
        this.graphics.drawCircle(0, 5, this.radius);
        this.graphics.endFill();
    }
}

const app = new PIXI.Application({
    view: document.querySelector(".background-canvas"),

    resizeTo: window,
    transparent: true
});

app.stage.filters = [new KawaseBlurFilter(30, 10, true)];


const colorPalette = new ColorPalette();

const orbs = [];

for (let i = 0; i < 20; i++) {
    const orb = new Orb(colorPalette.getColor());

    app.stage.addChild(orb.graphics);

    orbs.push(orb);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    app.ticker.add(() => {
        orbs.forEach((orb) => {
            orb.update();
            orb.render();
        });
    });
} else {
    orbs.forEach((orb) => {
        orb.update();
        orb.render();
    });
}
