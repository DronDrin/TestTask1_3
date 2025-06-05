let forecast = {
    temperatures: [],
    startHour: undefined
};

class Graph {
    constructor(element) {
        this.wrapper = element;
        this.body = element.querySelector('.weather-graph__body');
        this.canvas = element.querySelector('.weather-graph__canvas');
        this.selector = element.querySelector('.weather-graph__selector-dot');
        this.label = element.querySelector('.weather-graph__label');
        this.captions = element.querySelector('.weather-graph__captions')
        this.times = element.querySelector('.weather-graph__times');
    }

    loadData(heights, startHour) {
        this.dragging = false;
        this.data = heights;
        this.mouseInside = false;
        this.startHour = startHour;

        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.dotDistance = 65;
        this.dotRadius = 4;
        this.min = Math.min(...heights);
        this.max = Math.max(...heights);
        this.numPadding = (this.max - this.min) * 0.15;
        this.horizontalPadding = 50;

        this.calculateSizes(false);

        this.min -= this.numPadding;
        this.max += this.numPadding;
        this.draw();

        this.position = 0;
        this.lastMouseX = null;

        window.addEventListener('resize', () => {
            this.calculateSizes();
        });

        this.wrapper.addEventListener('mousedown', e => this.mouseDown(e));
        this.wrapper.addEventListener('mouseup', e => this.mouseUp(e));
        this.wrapper.addEventListener('mouseleave', e => this.mouseLeave(e));
        this.wrapper.addEventListener('mousemove', e => this.mouseMove(e));
    }

    mouseDown(e) {
        this.startDragging();
        this.lastMouseX = e.clientX;
    }

    mouseUp(e) {
        this.stopDragging();
    }

    mouseMove(e) {
        if (this.dragging && this.lastMouseX != null) {
            this.position += e.clientX - this.lastMouseX;
            this.updatePosition();

        }
        this.mouseInside = true;
        this.updateSelector(e.offsetX, e.offsetY);
        this.lastMouseX = e.clientX;
    }

    mouseLeave(e) {
        this.stopDragging()
        this.mouseInside = false;
        this.updateSelector(e.offsetX, e.offsetY);
    }

    draw() {
        this.drawGrid();
        this.drawLines();
        this.drawDots();
    }

    calculateSizes(redraw = true) {
        this.heigth = 400;
        this.width = this.dotDistance * (this.data.length - 1) +
            this.horizontalPadding * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.heigth;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.heigth + 'px';

        this.wrapperWidth = Math.min(this.width, window.innerWidth * 0.8);
        this.wrapper.style.width = this.wrapperWidth + 'px';

        if (redraw)
            this.draw();
        this.updatePosition();
    }

    stopDragging() {
        this.dragging = false;
        removeClass(this.wrapper, 'weather-graph_dragging');
    }

    startDragging() {
        this.dragging = true;
        addClass(this.wrapper, 'weather-graph_dragging');
    }

    updatePosition() {
        this.position = Math.min(0,
            Math.max(this.position, -this.width + this.wrapperWidth));
        this.body.style.left = this.position + 'px';
    }

    drawTimes() {
        const ctx = this.canvas.getContext('2d');

        this.times.innerHTML = '';
        let hour = this.startHour;
        let x = this.horizontalPadding;

        ctx.setLineDash([3, 10]);
        for (let i = 0; i < this.data.length;
             i++, hour = ++hour % 24, x += this.dotDistance) {
            const timeEl = document.createElement('div');
            addClass(timeEl, 'weather-graph__time');
            this.times.appendChild(timeEl);

            timeEl.innerText = this.getHourString(hour);
            timeEl.style.left = x + 'px';

            ctx.strokeStyle = 'rgba(14,38,75,0.94)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.getHeight(this.getDataOnArbitraryPosition(x)));
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    getHourString(hour) {
        let timezoneOffset = -new Date().getTimezoneOffset();
        hour += Math.floor(timezoneOffset / 60);
        let minute = timezoneOffset % 60;
        while (hour < 0)
            hour += 24;
        while (hour >= 24)
            hour -= 24;
        return `${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`;
    }

    drawGrid() {
        const step = 5;
        let bottomLine = Math.ceil(this.min / 5) * 5;
        let topLine = Math.floor(this.max / 5) * 5;

        const ctx = this.canvas.getContext('2d');
        ctx.strokeStyle = '#0e264b';
        ctx.lineWidth = 2;

        this.captions.innerHTML = '';
        for (let y = bottomLine; y <= topLine; y += step) {
            const yLevel = this.getHeight(y);
            ctx.beginPath();
            ctx.moveTo(0, yLevel);
            ctx.lineTo(this.width, yLevel);
            ctx.stroke();

            const caption = document.createElement("div");
            addClass(caption, 'weather-graph__caption');
            caption.innerText = y;
            caption.style.top = yLevel + 'px';
            this.captions.appendChild(caption);
        }
        this.drawTimes();
    }

    getDataOnArbitraryPosition(x) {
        x = Math.max(0, x - this.horizontalPadding);
        x /= this.dotDistance;
        x = Math.max(0, Math.min(x, this.data.length - 1));

        // may be the same (doesn't matter)
        const left = this.data[Math.floor(x)];
        const right = this.data[Math.ceil(x)];
        const betweenPos = x - Math.floor(x);

        const min = Math.min(left, right);
        const max = Math.max(left, right);

        return min + (max - min) * (left === min ? betweenPos : (1 - betweenPos));
    }

    updateSelector(mouseX) {
        if (this.mouseInside) {
            removeClass(this.selector, 'hidden');
            removeClass(this.label, 'hidden');

            let y = this.getDataOnArbitraryPosition(mouseX);
            let left = Math.max(this.horizontalPadding,
                Math.min(this.width - this.horizontalPadding, mouseX));
            let top = this.getHeight(y);

            this.selector.style.left = left + 'px';
            this.selector.style.top = top + 'px';

            this.label.innerText = Math.round(y * 10) / 10;
            this.label.style.left = left + 'px';
            this.label.style.top = top + 'px';
        } else {
            addClass(this.selector, 'hidden');
            addClass(this.label, 'hidden');
        }
    }

    getHeight(dataY) {
        return ((1 - (dataY - this.min) / (this.max - this.min))) * this.heigth;
    }

    drawDots() {
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#718ffd';

        let x = this.horizontalPadding;

        for (const y of this.data) {
            ctx.beginPath();
            ctx.arc(x, this.getHeight(y), this.dotRadius, 0, Math.PI * 2);
            ctx.fill();
            x += this.dotDistance;
        }
    }

    drawLines() {
        const ctx = this.canvas.getContext('2d');
        ctx.strokeStyle = '#718ffd';
        ctx.lineWidth = 3;

        ctx.beginPath();
        let x = this.horizontalPadding;
        ctx.moveTo(x, this.getHeight(this.data[0]));
        for (let i = 1; i < this.data.length; i++) {
            x += this.dotDistance;
            ctx.lineTo(x, this.getHeight(this.data[i]));
        }
        ctx.stroke();
    }
}

window.addEventListener('load', () => {
    forecast.temperatures = document.querySelector('meta[name="forecast-temperatures"]')
        .content.split(' ').map(t => Number(t));
    forecast.startHour = Number(document.querySelector('meta[name="forecast-starting-hour"]').content);
    let graph = new Graph(document.querySelector('.main__graph'));
    graph.loadData(forecast.temperatures, forecast.startHour);
});

function addClass(el, className) {
    if (!el.classList.contains(className))
        el.classList.add(className);
}

function removeClass(el, className) {
    if (el.classList.contains(className))
        el.classList.remove(className);
}
