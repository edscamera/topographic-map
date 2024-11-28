const TILESIZE = 48;
let tx = 0;
let ty = 0;
let genMode = 1;
let waterlevel;
let changeX = 0;
let changeY = 0;
let seed = Math.round(Math.random() * 1e10) - 1e5;
let cam = {
    x: 0,
    y: 0
}
function setup() {
    waterlevel = document.getElementById("waterLevel");
    document.querySelector("body").style.margin = 0;
    document.querySelector("body").oncontextmenu = function () {
        return false;
    }
    document.querySelector("html").style.overflowY = "hidden";

    createCanvas(windowWidth, windowHeight);

    rays = [];
    for (x = 0; x < 150; x++) {
        for (y = 0; y < 150; y++) {
            rays.push({
                x: x,
                y: y,
                height: noise(x / 20, y / 20)
            })
        }
    }
    rays.sort(function (a, b) {
        return b.y - a.y;
    });

    cam.x = windowWidth / -2;
    cam.y = windowHeight / -2;
    setTimeout(function () {
        cam.x = windowWidth / -2;
        cam.y = windowHeight / -2;
    }, 1000)
};
function mousePressed() {
    if (mouseButton === RIGHT) {
        origX = mouseX;
        origY = mouseY;
    }
    if (mouseButton === LEFT) {
        selected = [];
        for (i = 0; i < rays.length; i++) {
            t = getRay(rays[i].x, rays[i].y);
            if (Math.sqrt(Math.pow(mouseY - t.cy + (rays[i].height * 200), 2) + Math.pow(mouseX - t.cx, 2)) < 850) {
                selected.push({
                    id: i,
                    height: rays[i].height,
                    origMouseY: mouseY,
                    origMouseX: mouseX,
                    dist: Math.sqrt(Math.pow(mouseY - t.cy + (rays[i].height * 200), 2) + Math.pow(mouseX - t.cx, 2))
                })
            }
        }
    }
}
function mouseDragged() {
    if (mouseButton === RIGHT) {
        tx = mouseX - origX;
        ty = mouseY - origY;
    }
    if (mouseButton === LEFT) {
        for (i = 0; i < selected.length; i++) {
            t = getRay(rays[selected[i].id].x, rays[selected[i].id].y);
            dists = Math.sqrt(Math.pow(selected[i].origMouseY - t.cy + (rays[i].height * 200), 2) + Math.pow(selected[i].origMouseX - t.cx, 2));

            const closeness = 0.5 - Math.max(Math.min(dists / 855, 1), 0);
            rays[selected[i].id].height += ((mouseY - changeY) / -5000 / (1 + (25 / 12) ** (Math.abs(closeness) - 3.5)));
        }
        console.log((mouseY - changeY) / 10)
        changeX = mouseX;
        changeY = mouseY;
    }
}
function mouseReleased() {
    cam.x += tx;
    cam.y += ty;
    tx = 0;
    ty = 0;
    rays.sort(function (a, b) {
        return b.y - a.y;
    });
}
function keyPressed() {
    switch (keyCode) {
        case 32:
            seed = Math.round(Math.random() * 1e10) - 1e5;
            rays = [];
            for (x = 0; x < 150; x++) {
                for (y = 0; y < 150; y++) {
                    rays.push({
                        x: x,
                        y: y,
                        height: noise(x / 20 + seed, y / 20 + seed)
                    })
                }
            }
            rays.sort(function (a, b) {
                return b.y - a.y;
            });
            break;
    }
}
function draw() {
    background(0);
    fill(255, 0, 0);
    stroke(0);
    drawn = 0;
    textSize(20);
    fill(0);

    rays.forEach(r => {
        t = getRay(r.x, r.y);
        if (!(t.sx - (cam.x + tx) < 0 - TILESIZE || t.sx - (cam.x + tx) > windowWidth || t.sy - (cam.y + ty) < 0 || t.sy - (cam.y + ty) > windowHeight + height)) {
            drawn += 1;
            if (r.height > waterlevel.value / 100) {
                colorMode(HSL);
                fill(200 - r.height * 200, 100, r.height * 50);
                noStroke();
                renderRay(r.x, r.y, r.height * 200);
            } else {
                colorMode(HSL);
                fill(215, 100, 80 - Math.min(50, waterlevel.value - r.height * 50));
                noStroke();
                renderRay(r.x, r.y, waterlevel.value / 100 * 200);
            }
        }
    });
    stroke(255);
    text(drawn + "/" + rays.length + "\n" + Math.round(frameRate()) + "fps", 1, 21);
};
function renderRay(x, y, height) {
    ray(0.5 * TILESIZE * x + (y * TILESIZE * 0.5) - cam.x - tx, 0.25 * TILESIZE * x - (y * 0.25 * TILESIZE) - cam.y - ty, TILESIZE, height);
}
function getRay(x, y) {
    return {
        sx: 0.5 * TILESIZE * x + (y * TILESIZE * 0.5),
        sy: 0.25 * TILESIZE * x - (y * 0.25 * TILESIZE),
        cx: 0.5 * TILESIZE * x + (y * TILESIZE * 0.5) - cam.x - tx,
        cy: 0.25 * TILESIZE * x - (y * 0.25 * TILESIZE) - cam.y - ty
    };
}
function ray(x, y, width, height) {
    beginShape();
    vertex(x, y);
    vertex(x + width / 2, y + width / 4);
    vertex(x + width, y);
    vertex(x + width, y - height);
    vertex(x + width / 2, y - height - width / (height > 0 ? 4 : -4));
    vertex(x, y - height);
    vertex(x, y);
    /*
    if (height > 0) {
        vertex(x + width / 2, y + width / 4);
        vertex(x + width / 2, y - height + width / 4);
        vertex(x, y - height);
        vertex(x + width / 2, y - height + width / 4);
        vertex(x + width, y - height);
        vertex(x + width / 2, y - height + width / 4);
    }else{
        vertex(x + width / 2, y - width / 4);
        vertex(x + width, y);
        vertex(x + width / 2, y + width / 4);
        vertex(x + width / 2, y - height + width / 4)
    }
    */
    endShape();
};
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}