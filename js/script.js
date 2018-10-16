const FPS = 30; // number of updates per second
const CLOCK_RADIUS = 100; // Sets the size of the clock
const DAYS_OF_THE_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // array of days for word calendar
const MONTHS_OF_THE_YEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // array of months for word calendar
const DAYS_OF_THE_MONTH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]; // array of dates for word calendar
const CALENDAR = [[ 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7],[ 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14],[ 9,10,11,12,13,14,15,16,17,18,19,20,21],
                [16,17,18,19,20,21,22,23,24,25,26,27,28],[23,24,25,26,27,28,29,30,31, 0, 0, 0, 0],[30,31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
const COLORS = ["red", "orange", "yellow", "lime", "skyblue", "violet", "black", "white"];
const DEFAULT_PEN = COLORS[6]; // sets the default starting pen color
const DEFAULT_BACKGROUND = COLORS[7];
const PIXEL_RADIUS = 5;
const BUTTON_SIZE = 20; // pen selection button size
const BUTTON_OFFSET_X = 440;
const BUTTON_OFFSET_Y = 570;
const CALENDAR_ORIGIN = {x:12, y:270}; // top left of full calendar
const CALENDAR_DAY_WIDTH = 24;//how big to draw the calendar boxes on the full calendar

let canv = document.getElementById("board");
let ctx = canv.getContext("2d");
let selected_pen = DEFAULT_PEN;
let label_dragging = false;
let pen_selecting = false;
let rightnow;
let todo_list = [];

//sets up the clock
let radius = CLOCK_RADIUS * 0.90;

//sets up the word calendar
let labels = [];

labels.push({color: "lime", boxes: []});
for (let i = 0; i < DAYS_OF_THE_WEEK.length; i++) {
    labels[0].boxes.push({name: DAYS_OF_THE_WEEK[i], drag: false, x: (i * 129) + 5, y: 600, default_x: (i * 129) + 5, default_y: 600, w: 125, h: 20});
}

labels.push({color: "orange", boxes: []});
for (let i = 0; i < MONTHS_OF_THE_YEAR.length; i++) {
    labels[1].boxes.push({name: MONTHS_OF_THE_YEAR[i], drag: false, x: (i * 89) + 5, y: 625, default_x: (i * 89) + 5, default_y: 625, w: 85, h: 20});
}

labels.push({color: "violet", boxes: []});
for (let i = 0; i < DAYS_OF_THE_MONTH.length; i++) {
    labels[2].boxes.push({name: DAYS_OF_THE_MONTH[i], drag: false, x: (i * 34) + 5, y: 650, default_x: (i * 34) + 5, default_y: 650, w: 30, h: 20});
}

//sets up the pens
let pens = [];

for (let i = 0; i < COLORS.length; i++) {
    if (COLORS[i] != DEFAULT_BACKGROUND) {
        pens.push({color: COLORS[i], pixels: []});
    }
}

function updateToDo() {
    let todo = document.getElementById("todo-list");
    let output = "";

    for (let i = 0; i < todo_list.length; i++) {
        output += "<div id='task-" + i + "' style='margin:3px;padding:3px;border: 1px solid " + todo_list[i].color +";color:" +todo_list[i].color+";'>" + todo_list[i].description + "</div>";
    }

    todo.innerHTML = output;

    for (let i = 0; i < todo_list.length; i++) {
        document.getElementById('task-' + i).addEventListener("dblclick", function(){
            todo_list.splice(i, 1);
            updateToDo();
        });
    }
}

function addTask(descrip) {
    let task = {
        color: selected_pen,
        description: descrip
    };
    todo_list.push(task);
    document.getElementById("input").value = "";
    updateToDo();
}

function update() { //everything that needs to be drawn in every frame
    clearBoard();
    drawLines();
    drawClock();
    drawWordCalendar();
    rightnow = new Date();
    drawCalendar();
    drawLabels();
    drawPenButtons();
}

function clearBoard() {
    ctx.fillStyle = DEFAULT_BACKGROUND;
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function drawWordCalendar() {
    ctx.fillStyle = "lime";
    ctx.fillRect(35, 200, 129, 24);
    ctx.fillStyle = "white";
    ctx.fillRect(36, 201, 127, 22);
    ctx.fillStyle = "orange";
    ctx.fillRect(35, 228, 89, 24);
    ctx.fillStyle = "white";
    ctx.fillRect(36, 229, 87, 22);
    ctx.fillStyle = "violet";
    ctx.fillRect(130, 228, 34, 24);
    ctx.fillStyle = "white";
    ctx.fillRect(131, 229, 32, 22);
}

function drawClock() {
    ctx.translate(CLOCK_RADIUS, CLOCK_RADIUS);
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawTime(ctx, radius);
    ctx.translate(-CLOCK_RADIUS, -CLOCK_RADIUS);
}

function drawTime(ctx, radius) {
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    //hour
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI/(360 * 60));
    drawHand(ctx, hour, radius * 0.5, radius * 0.07);
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, radius * 0.07);
    //second
    second = (second * Math.PI/30);
    drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

function drawNumbers(ctx, radius) {
    let ang;
    ctx.font = radius * 0.17 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let num = 1; num < 13; num++) {
        ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.85);
        ctx.rotate(-ang);
    }
}

function drawFace(ctx, radius) {   
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function drawLines() {
    for (let i = 0; i < pens.length; i++) {
        for (let j = 0; j < pens[i].pixels.length; j++) {
            drawPixel(pens[i].color, pens[i].pixels[j].x, pens[i].pixels[j].y);
        }
    }
}

function drawPixel(color, x, y) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, PIXEL_RADIUS, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawLabels() {
    for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j <labels[i].boxes.length; j++) {
            ctx.fillStyle = labels[i].color;
            ctx.fillRect(labels[i].boxes[j].x, labels[i].boxes[j].y, labels[i].boxes[j].w, labels[i].boxes[j].h);
            ctx.font = "14px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(labels[i].boxes[j].name, labels[i].boxes[j].x + (labels[i].boxes[j].w/2), labels[i].boxes[j].y + (labels[i].boxes[j].h/2));
        }
    }
}

function drawPenButtons() {
    for (let i = 0; i < COLORS.length; i++) {
        if (COLORS[i] == selected_pen) {
            if (selected_pen != "white") {
                ctx.fillStyle = COLORS[i];
            }
            else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X - 2, BUTTON_OFFSET_Y - 2, BUTTON_SIZE + 4, BUTTON_SIZE + 4);
            ctx.fillStyle = "white";
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X - 1, BUTTON_OFFSET_Y - 1, BUTTON_SIZE + 2, BUTTON_SIZE + 2);
        }
        if (COLORS[i] == "white") {
            ctx.fillStyle = "black";
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X, BUTTON_OFFSET_Y, BUTTON_SIZE, BUTTON_SIZE);
            ctx.fillStyle = "white";
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X + 1, BUTTON_OFFSET_Y + 1, BUTTON_SIZE - 2, BUTTON_SIZE - 2);
        }
        else {
            ctx.fillStyle = COLORS[i];
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X, BUTTON_OFFSET_Y, BUTTON_SIZE, BUTTON_SIZE);
        }
    }
}

function sbDrag(event) {
    let msEvt = event;
    for (let i = 0; i < COLORS.length; i++) {
        if ((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X < msEvt.offsetX && (i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X + BUTTON_SIZE > msEvt.offsetX && BUTTON_OFFSET_Y < msEvt.offsetY && BUTTON_OFFSET_Y + BUTTON_SIZE > msEvt.offsetY) {
            selected_pen = COLORS[i];
            pen_selecting = true;
        }
    }
    for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j < labels[i].boxes.length; j++) {
            //if clicked on label, drag label
            if (labels[i].boxes[j].x < msEvt.offsetX && labels[i].boxes[j].x + labels[i].boxes[j].w > msEvt.offsetX && 
                labels[i].boxes[j].y < msEvt.offsetY && labels[i].boxes[j].y + labels[i].boxes[j].h > msEvt.offsetY) {
                labels[i].boxes[j].drag = true;
                label_dragging = true;
            }
        }
    }
    canv.onmousemove = sbMove;
}

function sbDrop(event) {
    let msEvt = event;
    for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j < labels[i].boxes.length; j++) {
            //35, 200, 129, 24
            if (labels[i].color == "lime" && msEvt.offsetX > 35 && msEvt.offsetX < 164 && msEvt.offsetY > 200 && msEvt.offsetY < 224) {
                //set all other labels in this set to their default x and y
                if (labels[i].boxes[j].drag == false) {
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                else {
                    //set the dropped label centered in the placeholder box
                    labels[i].boxes[j].x = 37;
                    labels[i].boxes[j].y = 202;
                }
            }
            //35, 228, 89, 24
            if (labels[i].color == "orange" && msEvt.offsetX > 35 && msEvt.offsetX < 124 && msEvt.offsetY > 228 && msEvt.offsetY < 252) {
                //set all other labels in this set to their default x and y
                if (labels[i].boxes[j].drag == false) {
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                //set the dropped label centered in the placeholder box
                else {
                    labels[i].boxes[j].x = 37;
                    labels[i].boxes[j].y = 230;
                }
            }
            //130, 228, 34, 24
            if (labels[i].color == "violet" && msEvt.offsetX > 130 && msEvt.offsetX < 164 && msEvt.offsetY > 228 && msEvt.offsetY < 252) {
                //set all other labels in this set to their default x and y
                if (labels[i].boxes[j].drag == false) {
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                //set the dropped label centered in the placeholder box
                else {
                    labels[i].boxes[j].x = 132;
                    labels[i].boxes[j].y = 230;
                }
            }
            labels[i].boxes[j].drag = false;
        }
    }
    label_dragging = false;
    pen_selecting = false;
    canv.onmousemove = null;
}

function sbMove(event) {
    let msEvt = event;
    if (label_dragging) {
        for (let i = 0; i < labels.length; i++) {
            for (let j = 0; j < labels[i].boxes.length; j++) {
                //drag label
                if (labels[i].boxes[j].drag == true) {
                    labels[i].boxes[j].x = msEvt.offsetX;
                    labels[i].boxes[j].y = msEvt.offsetY;
                }
            }
        }
    }
    else {
        if (!pen_selecting) {
            if (selected_pen != DEFAULT_BACKGROUND) {
                for (let i = 0; i < pens.length; i++) {
                    if (pens[i].color == selected_pen) {
                        pens[i].pixels.push({x: msEvt.offsetX, y: msEvt.offsetY});
                    }
                }
            }
            else {
                for (let i = 0; i < pens.length; i++) {
                    for (let j = 0; j < pens[i].pixels.length; j++) {
                        if (pens[i].pixels[j].x > msEvt.offsetX - (PIXEL_RADIUS * 2) && pens[i].pixels[j].x < msEvt.offsetX + (PIXEL_RADIUS * 2) && pens[i].pixels[j].y > msEvt.offsetY - (PIXEL_RADIUS * 2) && pens[i].pixels[j].y < msEvt.offsetY + (PIXEL_RADIUS * 2)) {
                            pens[i].pixels.splice(j, 1);
                        }
                    }
                }
            }
        }
    }
}

function makeCalendar(month=rightnow.getMonth()+1, year=rightnow.getFullYear()) {
    let date = new Date(year, month -1, 1, 1, 1, 1, 1);
    let search_index;
    if (date.getDate() > 7) {
        search_index = date.getDate() - date.getDay();
    }
    else {
        search_index = date.getDate() + 7 - date.getDay();
    }
    let display_index;
    for (let j = 0; j < CALENDAR.length; j++){
        for (let i = 0; i < 8; i++) {
            if (CALENDAR[j][i] == search_index) {
                display_index = i;
            }
        }
    }
    let do_29 = true;
    let do_31 = true;
    switch (month) {
        case 2:
            if (year % 4 != 0) do_29 = false;
        case 4:
        case 6:
        case 9:
        case 11:
            do_31 = false;
            break;
    }
    let display_calendar = [];
    for (let j = 0; j < CALENDAR.length; j++) {
        let week = [CALENDAR[j][display_index], CALENDAR[j][display_index + 1], CALENDAR[j][display_index + 2], CALENDAR[j][display_index + 3], CALENDAR[j][display_index + 4], CALENDAR[j][display_index + 5], CALENDAR[j][display_index + 6]];
        if (!do_29 && month == 2) {
            if (week.indexOf(29) >= 0) {
                week.splice(week.indexOf(29), 3);
            }
        }
        else if (month == 2) {
            if (week.indexOf(30) >= 0) {
                week.splice(week.indexOf(30), 2);
            }
        }
        else if (!do_31) {
            if (week.indexOf(31) >= 0) {
                week.splice(week.indexOf(31), 1);
            }
        }
        while (week.length < 7){
            week.push(0);
        }
        display_calendar.push(week);
    }
    return display_calendar;
}

function drawCalendar() {
    let mm = 10;
    for (let i = 0; i < labels[1].boxes.length; i++) {
        if (labels[1].boxes[i].x == 37 && labels[1].boxes[i].y == 230) {
            mm = i + 1;
        }
    }
    let display = makeCalendar(mm);
    ctx.font = "14px Arial";
    ctx.fillStyle = COLORS[4];
    ctx.fillRect(CALENDAR_ORIGIN.x, CALENDAR_ORIGIN.y, (CALENDAR_DAY_WIDTH + 1) * display[0].length + 1, (CALENDAR_DAY_WIDTH + 1) * display.length + 1);
    for (let i = 0; i < display.length; i++) {
        for (let j = 0; j < display[i].length;j++) {
            if (display[i][j] != 0) {
                ctx.fillStyle = DEFAULT_BACKGROUND;
                ctx.fillRect(CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1, CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1, CALENDAR_DAY_WIDTH, CALENDAR_DAY_WIDTH);           
                ctx.fillStyle = COLORS[4];
                ctx.fillText(display[i][j], CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1 + (CALENDAR_DAY_WIDTH/2), CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1 + (CALENDAR_DAY_WIDTH/2));
            }
        }
    }
}

canv.onmousedown = sbDrag;
canv.onmouseup = sbDrop;
