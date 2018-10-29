const FPS = 30; // number of updates per second
const MOON_X = 100;
const MOON_Y = 60;
const MOON_SCALE = 0.45;
const CLOCK_RADIUS = 100; // Sets the size of the clock
const DAYS_OF_THE_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // array of days for word calendar
const DAYS_ABBREVIATED = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS_OF_THE_YEAR = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // array of months for word calendar
const DAYS_OF_THE_MONTH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]; // array of dates for word calendar
const CALENDAR = [[ 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7],[ 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14],[ 9,10,11,12,13,14,15,16,17,18,19,20,21],
                [16,17,18,19,20,21,22,23,24,25,26,27,28],[23,24,25,26,27,28,29,30,31, 0, 0, 0, 0],[30,31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
const PIXEL_RADIUS = 5;
const BUTTON_SIZE = 20; // pen selection button size
const BUTTON_OFFSET_X = 440;
const BUTTON_OFFSET_Y = 570;
const CALENDAR_ORIGIN = {x:12, y:285}; // top left of full calendar
const CALENDAR_DAY_WIDTH = 24;//how big to draw the calendar boxes on the full calendar
const COLORS =[
    ["#f00", "#f60", "#ff3", "#3c3", "#3cc", "#c6f", "#333", "#fff"], // 0 - classic
    ["#f00", "#f60", "#ff3", "#3c3", "#3cc", "#c6f", "#fff", "#333"], // 1 - classic w/ darkmode
    ["#f22", "#e33", "#d44", "#c55", "#b66", "#a77", "#333", "#fff"], // 2 - shades of red
    ["#f22", "#e33", "#d44", "#c55", "#b66", "#a77", "#fff", "#333"], // 3 - shades of red w/ darkmode
    ["#2f2", "#3e3", "#4d4", "#5c5", "#6b6", "#7a7", "#333", "#fff"], // 4 - shades of green
    ["#2f2", "#3e3", "#4d4", "#5c5", "#6b6", "#7a7", "#fff", "#333"], // 5 - shades of green w/ darkmode
    ["#22f", "#33e", "#44d", "#55c", "#66b", "#77a", "#333", "#fff"], // 6 - shades of blue
    ["#22f", "#33e", "#44d", "#55c", "#66b", "#77a", "#fff", "#333"]  // 7 - shades of blue w/ darkmode
] 

let scheme_index = 0;
let DEFAULT_PEN = 6; // sets the default starting pen color
let DEFAULT_BACKGROUND = COLORS[scheme_index][7];
let canv = document.getElementById("board");
let ctx = canv.getContext("2d");
let selected_pen = DEFAULT_PEN;
let label_dragging = false;
let pen_selecting = false;
let rightnow = new Date();
let todo_list = [];
let moon_toggle = true;
let flip_the_moon = false;
let calendar_toggle = true;
let clock_toggle = true;
let radius = CLOCK_RADIUS * 0.90;
let labels = [];
let pens = [];
let yyyy = rightnow.getFullYear();
let last_mouse_X = 0;
let last_mouse_Y = 0;

labels.push({boxes: []});// set up the labels
for (let i = 0; i < DAYS_OF_THE_WEEK.length; i++) {
    labels[0].boxes.push({name: DAYS_OF_THE_WEEK[i], drag: false, x: (i * 129) + 5, y: 600, default_x: (i * 129) + 5, default_y: 600, w: 125, h: 20});
}
labels.push({boxes: []});
for (let i = 0; i < MONTHS_OF_THE_YEAR.length; i++) {
    labels[1].boxes.push({name: MONTHS_OF_THE_YEAR[i], drag: false, x: (i * 89) + 5, y: 625, default_x: (i * 89) + 5, default_y: 625, w: 85, h: 20});
}
labels.push({boxes: []});
for (let i = 0; i < DAYS_OF_THE_MONTH.length; i++) {
    labels[2].boxes.push({name: DAYS_OF_THE_MONTH[i], drag: false, x: (i * 34) + 5, y: 650, default_x: (i * 34) + 5, default_y: 650, w: 30, h: 20});
}

for (let i = 0; i < COLORS[scheme_index].length; i++) { //set up the pens
    if (COLORS[scheme_index][i] != DEFAULT_BACKGROUND) {
        pens.push({color: i, pixels: []});
    }
}

function updateToDo() {
    let todo = document.getElementById("todo-list");
    let output = "";
    document.getElementById("todo").style = "background-color:" + COLORS[scheme_index][7];
    for (let i = 0; i < todo_list.length; i++) {
        output += "<div id='task-" + i + "' style='margin:3px;padding:3px;border: 1px solid " + COLORS[scheme_index][todo_list[i].color] +";color:" + COLORS[scheme_index][todo_list[i].color] + ";'>" + todo_list[i].description + "</div>";
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
    let task;
    switch(descrip) {
        case "flip the moon":
            flipMoon();
            break;
        case "moon":
            toggleMoon();
            break;
        case "clock":
            toggleClock();
            break;
        case "calendar":
            toggleCalendar();
            break;
        case "help":
            task = {
                color: (selected_pen == 7? 6: selected_pen),
                description: "Welcome to the Smart Board by Murph Strange<br /><br />Type <b>clock</b> to enable/disable the clock display.<br />Type <b>moon</b> to enable/disable the moon phase indicator.<br />If you live in the Southern Hemisphere, and want the moon oriented to reflect your view of the moon, type <b>flip the moon</b>.<br />Type <b>calendar</b> to enable/disable the calendar display.<br />Type <b>help</b> to display this helpful message.<br />Type anything else to add a task to the to do list. Double-click an item on the to do list to remove it."
            }
            todo_list.push(task);
            document.getElementById("input").value = "";
            break;
        default:
            task = {
                color: (selected_pen == 7? 6: selected_pen),
                description: descrip
            };
            todo_list.push(task);
            document.getElementById("input").value = "";
            break;
    }
    updateToDo();
}

function update() { //everything that needs to be drawn in every frame
    clearBoard();
    rightnow = new Date();
    if (moon_toggle) {
        drawMoon();
    }
    if (clock_toggle) {
        drawClock();
    }
    if (calendar_toggle) {
        drawCalendar();
        
    }
    drawLines();
    drawPenButtons();
    if (calendar_toggle) {
        drawWordCalendar();
        drawLabels();
    }
}

function toggleMoon() {
    moon_toggle = !moon_toggle;
}

function flipMoon() {
    flip_the_moon = !flip_the_moon;
}

function toggleClock() {
    clock_toggle = !clock_toggle;
}

function toggleCalendar() {
    calendar_toggle = ! calendar_toggle;
}

function changeScheme(num) {
    if (num < 8 && num >= 0) {
        scheme_index = num;
    }
    updateToDo();
}

function clearBoard() {
    DEFAULT_BACKGROUND = COLORS[scheme_index][7];
    ctx.fillStyle = DEFAULT_BACKGROUND;
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function drawWordCalendar() {
    ctx.fillStyle = COLORS[scheme_index][3];
    ctx.fillRect(35, 200, 129, 24);
    ctx.fillStyle = DEFAULT_BACKGROUND;
    ctx.fillRect(36, 201, 127, 22);
    ctx.fillStyle = COLORS[scheme_index][1];
    ctx.fillRect(35, 228, 89, 24);
    ctx.fillStyle = DEFAULT_BACKGROUND;
    ctx.fillRect(36, 229, 87, 22);
    ctx.fillStyle = COLORS[scheme_index][5];
    ctx.fillRect(130, 228, 34, 24);
    ctx.fillStyle = DEFAULT_BACKGROUND;
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
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI/(360 * 60));
    drawHand(ctx, hour, radius * 0.5, radius * 0.07);
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, radius * 0.07);
    second = (second * Math.PI/30);
    drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
    ctx.strokeStyle = COLORS[scheme_index][6];
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
    ctx.font = radius * 0.17 + "px Arial";
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
    ctx.fillStyle = COLORS[scheme_index][6];
    ctx.fill();
}

function drawLines() {
    for (let i = 0; i < pens.length; i++) {
        for (let j = 0; j < pens[i].pixels.length; j++) {
            drawPixel(COLORS[scheme_index][i], pens[i].pixels[j].x, pens[i].pixels[j].y);
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
            switch (i) {
                case 0:
                    ctx.fillStyle = COLORS[scheme_index][3];
                    break;
                case 1:
                    ctx.fillStyle = COLORS[scheme_index][1];
                    break;
                case 2:
                    ctx.fillStyle = COLORS[scheme_index][5];
                    break;
            }
            ctx.fillRect(labels[i].boxes[j].x, labels[i].boxes[j].y, labels[i].boxes[j].w, labels[i].boxes[j].h);
            ctx.font = "14px Arial";
            ctx.fillStyle = DEFAULT_BACKGROUND;
            ctx.fillText(labels[i].boxes[j].name, labels[i].boxes[j].x + (labels[i].boxes[j].w/2), labels[i].boxes[j].y + (labels[i].boxes[j].h/2));
        }
    }
}

function drawPenButtons() {
    for (let i = 0; i < COLORS[scheme_index].length; i++) {
        if (i == selected_pen) {
            if (selected_pen != 7) {
                ctx.fillStyle = COLORS[scheme_index][i];
            }
            else {
                ctx.fillStyle = COLORS[scheme_index][6];
            }
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X - 2, BUTTON_OFFSET_Y - 2, BUTTON_SIZE + 4, BUTTON_SIZE + 4);
            ctx.fillStyle = DEFAULT_BACKGROUND;
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X - 1, BUTTON_OFFSET_Y - 1, BUTTON_SIZE + 2, BUTTON_SIZE + 2);
        }
        if (COLORS[scheme_index][i] == DEFAULT_BACKGROUND) {
            ctx.fillStyle = COLORS[scheme_index][6];
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X, BUTTON_OFFSET_Y, BUTTON_SIZE, BUTTON_SIZE);
            ctx.fillStyle = DEFAULT_BACKGROUND;
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X + 1, BUTTON_OFFSET_Y + 1, BUTTON_SIZE - 2, BUTTON_SIZE - 2);
        }
        else {
            ctx.fillStyle = COLORS[scheme_index][i];
            ctx.fillRect((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X, BUTTON_OFFSET_Y, BUTTON_SIZE, BUTTON_SIZE);
        }
    }
}

function sbDrag(event) {
    let msEvt = event;
    last_mouse_X = msEvt.offsetX;
    last_mouse_Y = msEvt.offsetY;
    for (let i = 0; i < COLORS[scheme_index].length; i++) {
        if ((i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X < msEvt.offsetX && (i * (BUTTON_SIZE + 5)) + BUTTON_OFFSET_X + BUTTON_SIZE > msEvt.offsetX && BUTTON_OFFSET_Y < msEvt.offsetY && BUTTON_OFFSET_Y + BUTTON_SIZE > msEvt.offsetY) {
            selected_pen = i;
            pen_selecting = true;
        }
    }
    for (let i = 0; i < labels.length; i++) {
        for (let j = 0; j < labels[i].boxes.length; j++) {
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
            if (i == 0 && msEvt.offsetX > 35 && msEvt.offsetX < 164 && msEvt.offsetY > 200 && msEvt.offsetY < 224) {
                if (labels[i].boxes[j].drag == false) { // set all other labels in this set to their default x and y
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                else { // set the dropped label centered in the placeholder box
                    labels[i].boxes[j].x = 37;
                    labels[i].boxes[j].y = 202;
                }
            }
            if (i == 1 && msEvt.offsetX > 35 && msEvt.offsetX < 124 && msEvt.offsetY > 228 && msEvt.offsetY < 252) {
                if (labels[i].boxes[j].drag == false) { //set all other labels in this set to their default x and y
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                else { //set the dropped label centered in the placeholder box
                    labels[i].boxes[j].x = 37;
                    labels[i].boxes[j].y = 230;
                }
            }
            if (i == 2 && msEvt.offsetX > 130 && msEvt.offsetX < 164 && msEvt.offsetY > 228 && msEvt.offsetY < 252) {
                if (labels[i].boxes[j].drag == false) { //set all other labels in this set to their default x and y
                    labels[i].boxes[j].x = labels[i].boxes[j].default_x;
                    labels[i].boxes[j].y = labels[i].boxes[j].default_y;
                }
                else { //set the dropped label centered in the placeholder box
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
                if (labels[i].boxes[j].drag == true) {
                    labels[i].boxes[j].x = msEvt.offsetX;
                    labels[i].boxes[j].y = msEvt.offsetY;
                }
            }
        }
    }
    else {
        if (!pen_selecting) {
            if (selected_pen != 7) {
                let x_form = xCoordFormula(last_mouse_X, last_mouse_Y, msEvt.offsetX, msEvt.offsetY);
                for (let xn = last_mouse_X; (last_mouse_X < msEvt.offsetX? xn < msEvt.offsetX: xn > msEvt.offsetX); (last_mouse_X < msEvt.offsetX? xn+=PIXEL_RADIUS*1.25:xn-=PIXEL_RADIUS*1.25)) {
                    pens[selected_pen].pixels.push({x: Math.floor(xn), y: Math.floor(x_form(xn))});
                }
                let y_form = yCoordFormula(last_mouse_X, last_mouse_Y, msEvt.offsetX, msEvt.offsetY);
                for (let yn = last_mouse_Y; (last_mouse_Y < msEvt.offsetY? yn < msEvt.offsetY: yn > msEvt.offsetY); (last_mouse_Y < msEvt.offsetY? yn+=PIXEL_RADIUS*1.25:yn-=PIXEL_RADIUS*1.25)) {
                    pens[selected_pen].pixels.push({x: Math.floor(y_form(yn)), y: Math.floor(yn)});
                }
                pens[selected_pen].pixels.push({x: msEvt.offsetX, y: msEvt.offsetY}); 
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
        last_mouse_X = msEvt.offsetX;
        last_mouse_Y = msEvt.offsetY;
    }
}

function makeCalendar(month=rightnow.getMonth()+1, year=rightnow.getFullYear()) {
    let date = new Date(year, month -1, 12, 1, 1, 1, 1);
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
    let mm = rightnow.getMonth()+1;
    for (let i = 0; i < labels[1].boxes.length; i++) {
        if (labels[1].boxes[i].x == 37 && labels[1].boxes[i].y == 230) {
            mm = i + 1;
        }
    }
    let dd = rightnow.getDate();
    for (let i = 0; i < labels[2].boxes.length; i++) {
        if (labels[2].boxes[i].x == 132 && labels[2].boxes[i].y == 230) {
            dd = i + 1;
        }
    }
    let wd = rightnow.getDay();
    for (let i = 0; i < labels[0].boxes.length; i++) {
        if (labels[0].boxes[i].x == 37 && labels[0].boxes[i].y == 202) {
            wd = i;
        }
    }
    let display = makeCalendar(mm, yyyy);
    ctx.font = "9px Arial";
    for (let i = 0; i < DAYS_ABBREVIATED.length; i++) {
        if (wd == i) {
            ctx.fillStyle = DEFAULT_BACKGROUND;
        }
        else {
            ctx.fillStyle = COLORS[scheme_index][4];
        }
        ctx.fillRect(CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * i) + 1, CALENDAR_ORIGIN.y - (CALENDAR_DAY_WIDTH/2) - 1, CALENDAR_DAY_WIDTH, CALENDAR_DAY_WIDTH/2);
        if (wd == i) {
            ctx.fillStyle = COLORS[scheme_index][4];
        }
        else {
            ctx.fillStyle = DEFAULT_BACKGROUND;
        }
        ctx.fillText(DAYS_ABBREVIATED[i], CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * i) + 1 + (CALENDAR_DAY_WIDTH/2), CALENDAR_ORIGIN.y - (CALENDAR_DAY_WIDTH/4)); 
    }
    ctx.font = "14px Arial";
    ctx.fillStyle = COLORS[scheme_index][4];
    ctx.fillRect(CALENDAR_ORIGIN.x, CALENDAR_ORIGIN.y, (CALENDAR_DAY_WIDTH + 1) * display[0].length + 1, (CALENDAR_DAY_WIDTH + 1) * display.length + 1);
    for (let i = 0; i < display.length; i++) {
        for (let j = 0; j < display[i].length;j++) {
            if (display[i][j] != 0) {
                ctx.fillStyle = DEFAULT_BACKGROUND;
                ctx.fillRect(CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1, CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1, CALENDAR_DAY_WIDTH, CALENDAR_DAY_WIDTH);
                ctx.fillStyle = COLORS[scheme_index][4];
                if (display[i][j] == dd) {
                    ctx.beginPath();
                    ctx.arc(CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1 + (CALENDAR_DAY_WIDTH/2), CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1 + (CALENDAR_DAY_WIDTH/2),
                    CALENDAR_DAY_WIDTH/2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = DEFAULT_BACKGROUND;
                    ctx.beginPath();
                    ctx.arc(CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1 + (CALENDAR_DAY_WIDTH/2), CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1 + (CALENDAR_DAY_WIDTH/2),
                    CALENDAR_DAY_WIDTH/2 - 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = COLORS[scheme_index][4];
                }
                ctx.fillText(display[i][j], CALENDAR_ORIGIN.x + ((CALENDAR_DAY_WIDTH + 1) * j) + 1 + (CALENDAR_DAY_WIDTH/2), CALENDAR_ORIGIN.y + ((CALENDAR_DAY_WIDTH + 1) * i) + 1 + (CALENDAR_DAY_WIDTH/2));
            }
        }
    }
}

function diffDays(first, second) {
    return Math.abs(first - second)/86400000.0;
}

function moonPhase(month=rightnow.getMonth()+1, day=rightnow.getDate(), year=rightnow.getFullYear() ) {
    let new_moon = new Date(2018, 9, 8, 3, 47, 1, 1);
    let lum_percent = Math.round(((diffDays(new_moon, new Date(year, month-1, day, 12, 1, 1, 1))%29.530588853)/29.530588853) * 100);
    if (new_moon > new Date(year, month-1, day, 12, 1, 1, 1)) {
        lum_percent = 100 - lum_percent;
    }
    if (lum_percent <= 9) {
        phase = "New";
    }
    else if (lum_percent > 9 && lum_percent < 23) {
        phase = "Waxing Cresent";
    }
    else if (lum_percent >= 23 && lum_percent <= 35) {
        phase = "First Quarter";
    }
    else if (lum_percent > 35 && lum_percent < 50) {
        phase = "Waxing Gibbous";
    }
    else if (lum_percent >= 50 && lum_percent <= 59) {
        phase = "Full";
    }
    else if (lum_percent > 59 && lum_percent < 75) {
        phase = "Waning Gibbous";
    }
    else if (lum_percent >= 75 && lum_percent <= 85) {
        phase = "Third Quarter";
    }
    else if(lum_percent > 85 && lum_percent <= 98) {
        phase = "Waning Cresent";
    }
    else {
        phase = "New";
    }
    return phase;
}

function drawMoon() {
    let waxing_gibbous = ctx.createRadialGradient(MOON_X, MOON_Y, 50 * MOON_SCALE, MOON_X - 15, MOON_Y, 50* MOON_SCALE);
    waxing_gibbous.addColorStop(0, "#333");
    waxing_gibbous.addColorStop(1, "#fff");
    let waning_gibbous = ctx.createRadialGradient(MOON_X, MOON_Y, 50* MOON_SCALE, MOON_X + 15, MOON_Y, 50* MOON_SCALE);
    waning_gibbous.addColorStop(0, "#333");
    waning_gibbous.addColorStop(1, "#fff");
    let waxing_cresent = ctx.createRadialGradient(MOON_X, MOON_Y, 60* MOON_SCALE, MOON_X + 25, MOON_Y, 50* MOON_SCALE);
    waxing_cresent.addColorStop(0, "#fff");
    waxing_cresent.addColorStop(1, "#333");
    let waning_cresent = ctx.createRadialGradient(MOON_X, MOON_Y, 60* MOON_SCALE, MOON_X - 25, MOON_Y, 50* MOON_SCALE);
    waning_cresent.addColorStop(0, "#fff");
    waning_cresent.addColorStop(1, "#333");
    let full_m = ctx.createRadialGradient(MOON_X, MOON_Y, 60* MOON_SCALE, MOON_X, MOON_Y, 40* MOON_SCALE);
    full_m.addColorStop(0, "#333");
    full_m.addColorStop(1, "#fff");
    let new_m = ctx.createRadialGradient(MOON_X, MOON_Y, 60* MOON_SCALE, MOON_X, MOON_Y, 40* MOON_SCALE);
    new_m.addColorStop(0, "#fff");
    new_m.addColorStop(1, "#333");
    let third_quarter = ctx.createLinearGradient(MOON_X - (10 * MOON_SCALE), MOON_Y, MOON_X + (10 * MOON_SCALE), MOON_Y);
    third_quarter.addColorStop(0, "#333");
    third_quarter.addColorStop(1, "#fff");
    let first_quarter = ctx.createLinearGradient(MOON_X - (10 * MOON_SCALE), MOON_Y, MOON_X + (10 * MOON_SCALE), MOON_Y);
    first_quarter.addColorStop(0, "#fff");
    first_quarter.addColorStop(1, "#333");
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(MOON_X, MOON_Y, 52 * MOON_SCALE, 0, Math.PI * 2, false);
    ctx.fill();
    let mm = rightnow.getMonth()+1;
    for (let i = 0; i < labels[1].boxes.length; i++) {
        if (labels[1].boxes[i].x == 37 && labels[1].boxes[i].y == 230) {
            mm = i + 1;
        }
    }
    let dd = rightnow.getDate();
    for (let i = 0; i < labels[2].boxes.length; i++) {
        if (labels[2].boxes[i].x == 132 && labels[2].boxes[i].y == 230) {
            dd = i + 1;
        }
    }
    switch(moonPhase(mm, dd, yyyy)) {
        case "New":
            ctx.fillStyle = new_m;
            break;
        case "Waxing Cresent":
            if (flip_the_moon) {
                ctx.fillStyle = waning_cresent;
            }
            else {
                ctx.fillStyle = waxing_cresent;
            }
            break;
        case "First Quarter":
            if (flip_the_moon) {
                ctx.fillStyle = third_quarter;
            }
            else {
                ctx.fillStyle = first_quarter;
            }
            break;
        case "Waxing Gibbous":
            if (flip_the_moon) {
                ctx.fillStyle = waning_gibbous;
            }
            else {
                ctx.fillStyle = waxing_gibbous;
            }
            break;
        case "Full":
            ctx.fillStyle = full_m;
            break;
        case "Waning Gibbous":
            if (flip_the_moon) {
                ctx.fillStyle = waxing_gibbous;
            }
            else {
                ctx.fillStyle = waning_gibbous;
            }
            break;
        case "Third Quarter":
            if (flip_the_moon) {
                ctx.fillStyle = first_quarter;
            }
            else {
                ctx.fillStyle = third_quarter;
            }
            break;
        case "Waning Cresent":
            if (flip_the_moon) {
                ctx.fillStyle = waxing_cresent;
            }
            else {
                ctx.fillStyle = waning_cresent;
            }
            break;
    }
    ctx.beginPath();
    ctx.arc(MOON_X, MOON_Y, 50 * MOON_SCALE, 0, Math.PI * 2, false);
    ctx.fill();
}

function slope(x1, y1, x2, y2) {
    return (y2 - y1)/(x2 - x1);
}

function yIntercept(x1, y1, x2, y2) {
    return (-1 * x1 * slope(x1, y1, x2, y2)) + y1;
}

function yCoordFormula(x1, y1, x2, y2) {
    return function(y) {
        return (y - (-1 * x1 *((y2 - y1) / (x2 - x1)) + y1))/((y2 - y1)/(x2 - x1));
    }
}
function xCoordFormula (x1, y1, x2, y2) {
    return function(x){
        return (slope(x1, y1, x2, y2) * x) + yIntercept(x1, y1, x2, y2);
    };
}

function makePlot(lineFunc) {
	return function(x) {
        return eval(lineFunc);
    };
}

function drawCartesianGrid() {

}

function morse_decoder(str) {
    let input = str;
    let output = "";

    let words_output = input.replace(/0000000/g, "0, ,"); //word break
    let letters_output = words_output.replace(/000/g, "0,"); //letter break
    let dahs_output = letters_output.replace(/1110/g, "dah"); //decode the dahs
    let dits_output = dahs_output.replace(/10/g, "dit"); //decode the dits
    let word_list = dits_output.split(","); //make a list of letters

    for (i = 0; i < word_list.length; i++) {
        switch(word_list[i]) {
            case "ditdah":
                // ._ a
                output += "a";
                break;
            case "dahditditdit":
                // _... b
                output += "b";
                break;
            case "dahditdahdit":
                // _._. c
                output += "c";
                break;
            case "dahditdit":
                // _.. d
                output += "d";
                break;
            case "dit":
                // . e
                output += "e";
                break;
            case "ditditdahdit":
                // .._. f
                output += "f";
                break;
            case "dahdahdit":
                // __. g
                output += "g";
                break;
            case "ditditditdit":
                // .... h
                output += "h";
                break;
            case "ditdit":
                // .. i
                output += "i";
                break;
            case "ditdahdahdah":
                // .___ j
                output += "j";
                break;
            case "dahditdah":
                // _._ k
                output += "k";
                break;
            case "ditdahditdit":
                // ._.. l
                output += "l";
                break;
            case "dahdah":
                // __ m
                output += "m";
                break;
            case "dahdit":
                // _. n
                output += "n";
                break;
            case "dahdahdah":
                // ___ o
                output += "o";
                break;
            case "ditdahdahdit":
                // .__. p
                output += "p";
                break;
            case "dahdahditdah":
                // __._ q
                output += "q";
                break;
            case "ditdahdit":
                // ._. r
                output += "r";
                break;
            case "ditditdit":
                // ... s
                output += "s";
                break;
            case "dah":
                // _ t
                output += "t";
                break;
            case "ditditdah":
                // .._ u
                output += "u";
                break;
            case "ditditditdah":
                // ..._ v
                output += "v";
                break;
            case "ditdahdah":
                // .__ w
                output += "w";
                break;
            case "dahditditdah":
                // _.._ x
                output += "x";
                break;
            case "dahditdahdah":
                // _.__ y
                output += "y";
                break;
            case "dahdahditdit":
                // __.. z
                output += "z";
                break;
            case "ditdahditdahditdah":
                // ._._._ .
                output += ".";
                break;
            case "dahdahditditdahdah":
                // __..__ ,
                output += ",";
                break;
            default:
                output += " ";
                break;

        }
    }
    
    return output;

}

function morse_encoder(str) {
    let input = str.toString().toLowerCase();
    let output = [];
    let dit = [1, 0];
    let dah = [1, 1, 1, 0];
    let separator = [0, 0];

    for (let i = 0; i < input.length; i++) {
        switch (input[i]) {
            case "a":
                // ._
                output = output.concat(dit, dah);
                break;
            case "b":
                // _...
                output = output.concat(dah, dit, dit, dit);
                break;
            case "c":
                // _._.
                output = output.concat(dah, dit, dah, dit);
                break;
            case "d":
                // _..
                output = output.concat(dah, dit, dit);
                break;
            case "e":
                // .
                output = output.concat(dit);
                break;
            case "f":
                // .._.
                output = output.concat(dit, dit, dah, dit);
                break;
            case "g":
                // __.
                output = output.concat(dah, dah, dit);
                break;
            case "h":
                // ....
                output = output.concat(dit, dit, dit, dit);
                break;
            case "i":
                // ..
                output = output.concat(dit, dit);
                break;
            case "j":
                // .___
                output = output.concat(dit, dah, dah, dah);
                break;
            case "k":
                // _._
                output = output.concat(dah, dit, dah);
                break;
            case "l":
                // ._..
                output = output.concat(dit, dah, dit, dit);
                break;
            case "m":
                // __
                output = output.concat(dah, dah);
                break;
            case "n":
                // _.
                output = output.concat(dah, dit);
                break;
            case "o":
                // ___
                output = output.concat(dah, dah, dah);
                break;
            case "p":
                // .__.
                output = output.concat(dit, dah, dah, dit);
                break;
            case "q":
                // __._
                output = output.concat(dah, dah, dit, dah);
                break;
            case "r":
                // ._.
                output = output.concat(dit, dah, dit);
                break;
            case "s":
                // ...
                output = output.concat(dit, dit, dit);
                break;
            case "t":
                // _
                output = output.concat(dah);
                break;
            case "u":
                // .._
                output = output.concat(dit, dit, dah);
                break;
            case "v":
                // ..._
                output = output.concat(dit, dit, dit, dah);
                break;
            case "w":
                // .__
                output = output.concat(dit, dah, dah);
                break;
            case "x":
                // _.._
                output = output.concat(dah, dit, dit, dah);
                break;
            case "y":
                // _.__
                output = output.concat(dah, dit, dah, dah);
                break;
            case "z":
                // __..
                output = output.concat(dah, dah, dit, dit);
                break;
            case ".":
                // ._._._
                output = output.concat(dit, dah, dit, dah, dit, dah);
                break;
            case ",":
                // __..__
                output = output.concat(dah, dah, dit, dit, dah, dah);
                break;
            case " ":
                output = output.concat(separator);
                break;
                
        }
        output = output.concat(separator);
    }
    return output.join("");
}

canv.onmousedown = sbDrag;
canv.onmouseup = sbDrop;
