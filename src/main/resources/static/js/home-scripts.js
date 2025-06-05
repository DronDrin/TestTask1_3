let mapHover, mapHovers, mapDots, map, locationWindow,
    scanLineEl, searchInput, searchButton, searchWindow, mapBlocker, tryAgainButton;
let points = [];
let mapScale = 1;
let renderMapScale = 1;
let movingMap = false;
let lastMouseX = undefined, lastMouseY = undefined;
let mapX = 0, mapY = 0;
let mapByHeight = false;
let mapHeight, mapWidth;
let scalingMode = false;
let runningScanLine = false;
let scanLineIteration = 0;
let onScanlineEnd;
let scanPointsLoaded = false, scanPointsLastIteration;

function moveMap() {
    let mapMinX, mapMinY;

    mapMinX = (renderMapScale * window.innerWidth - window.innerWidth) / 2;
    mapMinY = (renderMapScale * window.innerHeight - window.innerHeight) / 2;

    mapX = Math.max(Math.min(mapX, mapMinX), -mapMinX);
    mapY = Math.max(Math.min(mapY, mapMinY), -mapMinY);

    locationWindow.style.left = mapX + 'px';
    locationWindow.style.top = mapY + 'px';
}

window.addEventListener('load', () => {
    mapHover = document.getElementById('mapHover');
    mapHovers = document.getElementById('mapHovers');
    mapDots = document.getElementById('mapDots');
    map = document.getElementById('map');
    scanLineEl = document.getElementById('scanLine');
    searchInput = document.getElementById('searchInput');
    locationWindow = document.getElementById('locationWindow');
    searchButton = document.getElementById('searchButton');
    searchWindow = document.getElementById('searchWindow');
    mapBlocker = document.getElementById('mapBlocker');
    tryAgainButton = document.getElementById('tryAgainButton');

    resize();

    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => {
        let rect = mapHovers.getBoundingClientRect();

        mapHover.style.left = (e.clientX - rect.x) / rect.width * 100 + '%';
        mapHover.style.top = (e.clientY - rect.y) / rect.height * 100 + '%';

        if (movingMap) {
            if (lastMouseX !== undefined) {
                mapX += e.clientX - lastMouseX;
                mapY += e.clientY - lastMouseY;
                moveMap();
            }
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    })

    locationWindow.addEventListener('mousedown', e => {
        movingMap = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    locationWindow.addEventListener('mouseup', e => {
        movingMap = false;
    });

    locationWindow.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY > 0) {
            if (mapScale > 1)
                mapScale /= 1.5;
        } else
            mapScale *= 1.5;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    timer();

    searchInput.addEventListener('input', e => {
        if (searchInput.value !== "")
            removeClass(searchButton, 'hidden');
        else
            addClass(searchButton, 'hidden');
    });

    searchButton.addEventListener('click', e => {
        let query = searchInput.value.trim();
        if (/^([A-Za-z_0-9,.] ?)+$/.test(query)) {
            addClass(searchWindow, 'hidden');
            runDisplayPoints(() => {
                scalingMode = true;
                addClass(mapBlocker, 'hidden');
                setTimeout(() => {
                    addClass(tryAgainButton, 'show');
                }, 500);
            });
            fetch('/api/v1/location/?query=' + query).then(res => res.json().then(json => {
                for (const point of json) {
                    addScanPoint(point.lat, point.lon);
                }
                scanPointsLoaded = true;
            }));
        } else {
            addClass(searchInput, 'search-window__input_invalid');
            searchInput.style.animation = 'none';
            setTimeout(() => searchInput.style.animation = null, 10);
        }
    });

    tryAgainButton.addEventListener('click', () => {
        location.reload();
    });
});

function pointClicked(point) {
    console.log(point.lat, point.lon);
}


function runDisplayPoints(finishCallback) {
    removeAllPoints();
    scanPointsLastIteration = scanPointsLoaded = false;
    setTimeout(() => {
        runScanline(() => {
            removeClass(locationWindow, 'location_hidden');
            finishCallback();
        });
    }, 300);
}

function removeAllPoints() {
    points.forEach((point) => {
        point.dot.remove();
        point.hover.remove();
    });
    points = [];
}

function timer() {
    setTimeout(timer, 10);
    scanLineTick();
    scaleMap();
}

function scaleMap() {
    const rect = map.getBoundingClientRect();
    if (!scalingMode)
        mapScale = 1;
    let delta = mapScale - renderMapScale;
    delta *= 0.15;
    renderMapScale += delta;

    locationWindow.style.transform = `scale(${renderMapScale})`;
    points.forEach(p => p.dot.style.transform = `scale(${1 / renderMapScale}) translateX(-50%) translateY(-50%)`);
    if (lastMouseX !== undefined) {
        mapX -= delta * window.innerWidth * ((lastMouseX - rect.x) / rect.width - 0.5);
        mapY -= delta * window.innerHeight * ((lastMouseY - rect.y) / rect.height - 0.5);
    }
    moveMap();
}

function resize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const imageWidth = 2000;
    const imageHeight = 1280;

    const heightByWidth = (imageHeight / imageWidth) * screenWidth;
    const widthByHeight = (imageWidth / imageHeight) * screenHeight;
    mapByHeight = heightByWidth > screenHeight;
    if (mapByHeight) {
        mapHeight = screenHeight;
        mapWidth = widthByHeight;
    } else {
        mapWidth = screenWidth;
        mapHeight = heightByWidth;
    }

    mapDots.style.width = mapHovers.style.width = map.style.width
        = mapWidth + 'px';
    mapDots.style.height = mapHovers.style.height = map.style.height
        = mapHeight + 'px';

    mapHover.style.left = 0 + 'px';
    mapHover.style.top = 0 + 'px';
}

function runScanline(finishCallback) {
    addClass(locationWindow, 'location_scan');
    scanLineEl.style.top = -window.innerHeight + 'px';
    runningScanLine = true;
    onScanlineEnd = finishCallback;
    scanLineIteration = 0;
}

function scanLineTick() {
    if (runningScanLine) {
        let rect = scanLineEl.getBoundingClientRect();
        if (scanLineIteration > 0 && scanPointsLoaded) {
            scanPointsLastIteration = true;
            points.forEach(p => {
                if (p.dot.getBoundingClientRect().bottom <
                    rect.y + rect.height / 2 + window.innerHeight / 8.307) {
                    removeClass(p.dot, 'hidden');
                    removeClass(p.hover, 'hidden');
                } else if (scanPointsLastIteration && p.dot.classList.contains('hidden'))
                    scanPointsLastIteration = false;
            });
        }
        let y = Number(scanLineEl.style.top.slice(0, -2));
        if (y > window.innerHeight) {
            y = -window.innerHeight;
            scanLineIteration++;
            if (scanPointsLastIteration) {
                runningScanLine = false;
                removeClass(locationWindow, 'location_scan');
                onScanlineEnd();
                return;
            }
        }
        scanLineEl.style.top = y + window.innerHeight / 200 + 'px';
    }
}

function addScanPoint(lat, lon) {
    let point = addGeoPoint(lat, lon);
    point.dot.classList.add('hidden');
    point.hover.classList.add('hidden');
}

function addGeoPoint(lat, lon) {
    lat = Math.log(Math.tan(Math.PI / 4 + ((lat + 1.7) * Math.PI / 180) / 2));
    const latMax = Math.log(Math.tan(Math.PI / 4 + (84.3 * Math.PI / 180) / 2));
    const latMin = Math.log(Math.tan(Math.PI / 4 + (-58 * Math.PI / 180) / 2));

    if (lon <= -169.62890625000003)
        lon += 360;
    lon *= 0.97;
    lon += 180;
    lon -= 7.3;

    let point = addPoint(lon / 360, ((latMax - lat) / (latMax - latMin)));
    point.lat = lat;
    point.lon = lon;
    return point;
}

// x, y  ->  0 ... 1
function addPoint(x, y) {
    const point = {
        dot: document.createElement('div'),
        hover: document.createElement('div')
    };

    addClass(point.dot, 'map__dot');
    addClass(point.hover, 'map__dot_hover');

    point.dot.style.left = (x * 100) + '%';
    point.dot.style.top = (y * 100) + '%';

    point.hover.style.left = (x * 100) + '%';
    point.hover.style.top = (y * 100) + '%';

    mapHovers.appendChild(point.hover);
    mapDots.appendChild(point.dot);

    points.push(point);

    point.dot.addEventListener('mouseover', () => {
        addClass(point.dot, 'map__dot_active');
        addClass(point.hover, 'map__dot_hover_active');
    });

    point.dot.addEventListener('mouseleave', () => {
        removeClass(point.dot, 'map__dot_active');
        removeClass(point.hover, 'map__dot_hover_active');
    });
    point.dot.addEventListener('click', () => {
        pointClicked(point);
    });
    return point;
}

function addClass(el, className) {
    if (!el.classList.contains(className))
        el.classList.add(className);
}

function removeClass(el, className) {
    if (el.classList.contains(className))
        el.classList.remove(className);
}