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
const CARTORIG_X = 436;
const CARTORIG_Y = 236;
const CART_SIZE = 400;
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
if (typeof(Storage) !== "undefined" && localStorage.getItem("theme")) {
    scheme_index = Number(localStorage.getItem("theme"));
}
let DEFAULT_PEN = 6; // sets the default starting pen color
let DEFAULT_BACKGROUND = COLORS[scheme_index][7];
let canv = document.getElementById("board");
let ctx = canv.getContext("2d");
let selected_pen = DEFAULT_PEN;
let label_dragging = false;
let pen_selecting = false;
let rightnow = new Date();
let todo_list = [];
let cart_lines = [];
let moon_toggle = true;
let flip_the_moon = false;
let calendar_toggle = true;
let clock_toggle = true;
let cartesian_grid = false;
let tracker_toggle = false;
let radius = CLOCK_RADIUS * 0.90;
let labels = [];
let pens = [];
let yyyy = rightnow.getFullYear();
let last_mouse_X = 0;
let last_mouse_Y = 0;
let tracker = [];

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

if (typeof(Storage) !== "undefined") {//see if settings were changed previously by the user
    if (localStorage.getItem("moon_toggle")){
        moon_toggle = (localStorage.getItem("moon_toggle")=="true"?true:false);
    }
    if (localStorage.getItem("moon_toggle")){
        flip_the_moon = (localStorage.getItem("flip_the_moon")=="true"?true:false);
    }
    if (localStorage.getItem("moon_toggle")){
        calendar_toggle = (localStorage.getItem("calendar_toggle")=="true"?true:false);
    }
    if (localStorage.getItem("moon_toggle")){
        clock_toggle = (localStorage.getItem("clock_toggle")=="true"?true:false);
    }
    if (localStorage.getItem("moon_toggle")){
        cartesian_grid = (localStorage.getItem("cartesian_grid")=="true"?true:false);
    }
    if (localStorage.getItem("moon_toggle")){
        tracker_toggle = (localStorage.getItem("tracker_toggle")=="true"?true:false);
    }
}

function initToDo() {
    let task;
    task = {
        color: (selected_pen == 7? 6: selected_pen),
        description: "<div id='tracker'></div>"
    }
    todo_list.push(task);
    task = {
        color: (selected_pen == 7? 6: selected_pen),
        description: "<div id='graph-list'></div>"
    }
    todo_list.push(task);
    updateToDo();
}

function updateToDo() {
    let todo = document.getElementById("todo-list");
    let output = "";
    document.getElementById("todo").style = "background-color:" + COLORS[scheme_index][7];
    for (let i = 0; i < todo_list.length; i++) {
        output += "<div id='task-" + i + "' style='margin:3px;padding:3px;border: 1px solid " + COLORS[scheme_index][todo_list[i].color] +";color:" + COLORS[scheme_index][todo_list[i].color] + ";'>" + todo_list[i].description + "</div>";
    }
    output += "<style>.marked{background-color: " + COLORS[scheme_index][2] + ";}</style>"
    todo.innerHTML = output;
    for (let i = 0; i < todo_list.length; i++) {
        if (i > 1) {
            document.getElementById('task-' + i).addEventListener("dblclick", function(){
                todo_list.splice(i, 1);
                updateToDo();
            });
        }
    }
    if (tracker_toggle) {
        updateTracker();
    }
    if (cartesian_grid) {
        updateGraphList();
    }
}

function initTracker() {
    if (typeof(Storage) !== "undefined" && localStorage.getItem("Jan")) {
        for (let i = 0; i < 12; i++) {
            let mm = "";
            switch(i){
                case 0:
                    mm = "Jan";
                    break;
                case 1:
                    mm = "Feb";
                    break;
                case 2:
                    mm = "Mar";
                    break;
                case 3:
                    mm = "Apr";
                    break;
                case 4:
                    mm = "May";
                    break;
                case 5:
                    mm = "Jun";
                    break;
                case 6:
                    mm = "Jul";
                    break;
                case 7:
                    mm = "Aug";
                    break;
                case 8:
                    mm = "Sep";
                    break;
                case 9:
                    mm = "Oct";
                    break;
                case 10:
                    mm = "Nov";
                    break;
                case 11:
                    mm = "Dec";
                    break;
            }
            let dd = localStorage.getItem(mm).split(",");
            for (let j = 0; j < dd.length; j++){
                if (dd[j] == "true") {
                    dd[j] = true;
                }
                else {
                    dd[j] = false;
                }
            }
            tracker.push([mm].concat(dd));
        }
    }
    else {
        for (let x = 0; x < 12; x++) {
            let month = [];
            let days = 0;
            switch(x) {
                case 0:
                    month.push("Jan");
                    days = 31;
                    break;
                case 1:
                    month.push("Feb");
                    days = 29;
                    break;
                case 2:
                    month.push("Mar");
                    days = 31;
                    break;
                case 3:
                    month.push("Apr");
                    days = 30;
                    break;
                case 4:
                    month.push("May");
                    days = 31;
                    break;
                case 5:
                    month.push("Jun");
                    days = 30;
                    break;
                case 6:
                    month.push("Jul");
                    days = 31;
                    break;
                case 7:
                    month.push("Aug");
                    days = 31;
                    break;
                case 8:
                    month.push("Sep");
                    days = 30;
                    break;
                case 9:
                    month.push("Oct");
                    days = 31;
                    break;
                case 10:
                    month.push("Nov");
                    days = 30;
                    break;
                case 11:
                    month.push("Dec");
                    days = 31;
                    break;
            }
            for (let y = 0; y < days; y++) {
                month.push(false);
            }
            tracker.push(month);
        }
    }
}

function updateGraphList() {
    let graphForm = document.getElementById("graph-list");
    let output = "<form><label for='fomula'>Y = </label><input name='formula' id='formula' type='text' size='10' /><button type='button' id='plot-btn'>Plot</button></form><br />";
    for (let i = 0; i < cart_lines.length; i++) {
        output += "<div id='graph-" + i + "' style='margin:3px;padding:3px;border: 1px solid " + COLORS[scheme_index][cart_lines[i].color] +";color:" + COLORS[scheme_index][cart_lines[i].color] + ";'>" + cart_lines[i].description + "</div>";
    }
    graphForm.innerHTML = output;
    document.getElementById("plot-btn").addEventListener("click", function() {
        addGraphFormula(document.getElementById("formula").value);
    });
    for (let i = 0; i < cart_lines.length; i++) {
        document.getElementById('graph-' + i).addEventListener("dblclick", function(){
            cart_lines.splice(i, 1);
            updateGraphList();
        });
    }
}

function addGraphFormula(descrip) {
    formula = {
        color: (selected_pen == 7? 6: selected_pen),
        description: descrip
    };
    cart_lines.push(formula);
    document.getElementById("formula").value = "";
    updateGraphList();
}

function updateTracker() {
    var calendar = document.getElementById("tracker");
    var output = "<table><tr>";
    for (var x = 0; x < tracker.length; x++) { //header
        output += "<th>" + tracker[x][0] + "</th>";
    }
    output += "</tr>";
    for (var y = 1; y < tracker[0].length; y++) {//each row
        output += "<tr>";
        for (var x = 0; x < tracker.length; x++) {//each day
            if (tracker[x][y] == undefined) {
                output += "<td></td>";
            }
            else if (tracker[x][y]) {
                output += "<td id='cal-" + x + "-" + y
                 + "' class='cal marked'>" + y + "</td>";
            }
            else {
                output += "<td id='cal-" + x + "-" + y
                  + "' class='cal'>" + y + "</td>";
            }
        }
        output += "</tr>";
    }
    output += "</table>";
    calendar.innerHTML = output;
    let cells = document.getElementsByClassName("cal");
    let patt = /\d{1,}/g;
    for (let i = 0; i < cells.length; i++) {//add onclick
        cells[i].onclick = function(e){
            let mm = patt.exec(e.target.attributes.id.nodeValue.toString());
            let dd = patt.exec(e.target.attributes.id.nodeValue.toString());
            let bucket = patt.exec(e.target.attributes.id.nodeValue.toString());
            tracker[mm][dd] = !tracker[mm][dd];
            updateTracker();
        };
    }
    if (typeof(Storage) !== "undefined") {
        for (var i = 0; i < tracker.length; i ++){
            localStorage.setItem(tracker[i][0], tracker[i].slice(1,tracker[i].length).join());
        }
    }
}

function addTask(descrip) {
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
        case "tracker":
            toggleTracker();
            break;
        case "graph":
            toggleCartGraph();
            break;
        case "theme 1":
            changeScheme(0);
            break;
        case "theme 2":
            changeScheme(1);
            break;
        case "theme 3":
            changeScheme(2);
            break;
        case "theme 4":
            changeScheme(3);
            break;
        case "theme 5":
            changeScheme(4);
            break;
        case "theme 6":
            changeScheme(5);
            break;
        case "theme 7":
            changeScheme(6);
            break;
        case "theme 8":
            changeScheme(7);
            break;
        case "help":
            task = {
                color: (selected_pen == 7? 6: selected_pen),
                description: "Welcome to the <br /><b>Smart Board</b> by Murph Strange<br /><br />Type <b>clock</b> to enable/disable the clock display.<br />Type <b>moon</b> to enable/disable the moon phase indicator.<br />If you live in the Southern Hemisphere, and want the moon oriented to reflect your view of the moon, type <b>flip the moon</b>.<br />Type <b>calendar</b> to enable/disable the calendar display.<br />Type <b>theme #</b>, but replace the # with a number between 1 and 8 to select a color theme. Theme changes are remembered by your browser (unless you clear the cache). The themes are as follows:<br /><br /><b>1</b> Classic<br /><b>2</b> Classic - Dark Mode<br /><b>3</b> Red<br /><b>4</b> Red - Dark Mode<br /><b>5</b> Green<br /><b>6</b> Green - Dark Mode<br /><b>7</b> Blue<br /><b>8</b> Blue - Dark Mode<br /><br />Type <b>tracker</b> to show/hide the habit tracker at the top of the to do list. It's a little calendar that you can use to track the completion of a daily routine item you want to make a habit. Like exercising. Or practicing a skill. When you've completed whatever it is, click the date on the tracker to mark it, so you can see your progress over the course of the year. The tracker will remember days even if you close the browser window (just don't clear your cache. Habit tracker based on similar, but better, idea by <a href='http://www.simonegiertz.com/' target='_blank'>Simone Giertz</a>, you should totally see what she's up to, it's probably hilariously brilliant).<br />Oh, did you need a graphing calculator? Type <b>graph</b> to enable/disable the built in Graphing Calculator! Couple things, it uses computer math, so 2x is written like (2*x) with an asterisk and the whole thing in parenthesis. Same with exponents, x to the second power is written as (x**2), with a double asterisk. Enjoy experimenting with that! Scale for the graph is fixed at a range of -20 to 20 on either axis, with no zoom, so it is only really going to help with some very basic high school algebra.<br />Type <b>help</b> to display this helpful message.<br />Type anything else to add a task to the to do list. Double-click an item on the to do list to remove it."
            };
            todo_list.push(task);
            document.getElementById("input").value = "";
            break;
        default:
            task = {
                color: (selected_pen == 7? 6: selected_pen),
                description: descrip,
                date: null,
                alarm: false,
            };
            if (document.getElementById("schedule").checked) {
                let mm_sel = document.getElementById("month").options[document.getElementById("month").selectedIndex].value;
                let dd_sel = document.getElementById("date").options[document.getElementById("date").selectedIndex].value;
                let hh_sel = document.getElementById("hour").options[document.getElementById("hour").selectedIndex].value;
                let mn_sel = document.getElementById("minute").options[document.getElementById("minute").selectedIndex].value;
                let mr_sel = document.getElementById("meridian").options[document.getElementById("meridian").selectedIndex].value;
                let dt = new Date(
                    (rightnow.getMonth()<Number(mm_sel)||(rightnow.getMonth()==Number(mm_sel)&&rightnow.getDate()<Number(dd_sel))?rightnow.getFullYear()+1:rightnow.getFullYear()),
                    Number(mm_sel),
                    Number(dd_sel),
                    (mr_sel=="1"?Number(hh_sel)+12:Number(hh_sel)),
                    Number(mn_sel),
                    0);
                task.date = dt;
                task.alarm = document.getElementById("alarm").checked;
            }
            todo_list.push(task);
            document.getElementById("input").value = "";
            break;
    }
    updateToDo();
}

function scheduleSelected() {
    let scheduled = document.getElementById("schedule");
    if (scheduled.checked) {
        document.getElementById("month").removeAttribute('disabled');
        document.getElementById("date").removeAttribute('disabled');
        document.getElementById("hour").removeAttribute('disabled');
        document.getElementById("minute").removeAttribute('disabled');
        document.getElementById("meridian").removeAttribute('disabled');
        document.getElementById("alarm").removeAttribute('disabled');
    }
    else {
        document.getElementById("month").setAttribute("disabled", "true");
        document.getElementById("date").setAttribute("disabled", "true");
        document.getElementById("hour").setAttribute("disabled", "true");
        document.getElementById("minute").setAttribute("disabled", "true");
        document.getElementById("meridian").setAttribute("disabled", "true");
        document.getElementById("alarm").setAttribute("disabled", "true");
    }
}

function selectionDateFixer() {
    let mm = document.getElementById("month");
    let days_sel = document.getElementById("date");
    let days = 29;
    switch(mm.options[mm.selectedIndex].value) {
        case '0':
        case '2':
        case '4':
        case '6':
        case '7':
        case '9':
        case '11':
            days = 31
            break;
        case '3':
        case '5':
        case '8':
        case '10':
            days = 30
            break;
    }
    while (days_sel.options.length) {
        days_sel.options.remove(0);
    }
    for (let i = 1; i <= days; i++) {
        days_sel.options.add(new Option(i, i));
    }
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
    if (cartesian_grid) {
        drawCartesianGrid();
        for (let h = 0; h < cart_lines.length; h++) {
            cartLine(COLORS[scheme_index][cart_lines[h].color], cart_lines[h].description);
        }            
    }
    drawLines();
    drawPenButtons();
    if (calendar_toggle) {
        drawWordCalendar();
        drawLabels();
    }
}

function toggleCartGraph() {
    cartesian_grid = !cartesian_grid;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("cartesian_grid", cartesian_grid);
    }
}

function toggleMoon() {
    moon_toggle = !moon_toggle;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("moon_toggle", moon_toggle);
    }
}

function toggleTracker() {
    tracker_toggle = !tracker_toggle;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("tracker_toggle", tracker_toggle);
    }
}

function flipMoon() {
    flip_the_moon = !flip_the_moon;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("flip_the_moon", flip_the_moon);
    }
}

function toggleClock() {
    clock_toggle = !clock_toggle;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("clock_toggle", clock_toggle);
    }
}

function toggleCalendar() {
    calendar_toggle = ! calendar_toggle;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("calendar_toggle", calendar_toggle);
    }
}

function changeScheme(num) {
    if (num < 8 && num >= 0) {
        scheme_index = num;
    }
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("theme", scheme_index);
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
    ctx.beginPath();
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
                    ctx.fillStyle = COLORS[scheme_index][4];
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
                ctx.fillStyle = waxing_cresent;
            }
            else {
                ctx.fillStyle = waning_cresent;
            }
            break;
        case "First Quarter":
            if (flip_the_moon) {
                ctx.fillStyle = first_quarter;
            }
            else {
                ctx.fillStyle = third_quarter;
            }
            break;
        case "Waxing Gibbous":
            if (flip_the_moon) {
                ctx.fillStyle = waxing_gibbous;
            }
            else {
                ctx.fillStyle = waning_gibbous;
            }
            break;
        case "Full":
            ctx.fillStyle = full_m;
            break;
        case "Waning Gibbous":
            if (flip_the_moon) {
                ctx.fillStyle = waning_gibbous;
            }
            else {
                ctx.fillStyle = waxing_gibbous;
            }
            break;
        case "Third Quarter":
            if (flip_the_moon) {
                ctx.fillStyle = third_quarter;
            }
            else {
                ctx.fillStyle = first_quarter;
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

function cartLine(color, func) {
    let y_plotter = makePlot(func);
    ctx.moveTo((-20.1 * 10)+ CARTORIG_X, (y_plotter(-20.1) * -10) + CARTORIG_Y);
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let x = -20; x <= 20; x += 0.1) {
        if (y_plotter(x) > -20.0 && y_plotter(x) < 20.0) {
            ctx.lineTo((x * 10) + CARTORIG_X, (y_plotter(x) * -10) + CARTORIG_Y);
        }
        else {
            ctx.stroke();
            ctx.moveTo((x * 10) + CARTORIG_X, (y_plotter(x) * -10) + CARTORIG_Y);
            ctx.beginPath();
        }
    }
    ctx.stroke();
}

function drawCartesianGrid() {
    ctx.strokeStyle = COLORS[scheme_index][0];
    ctx.beginPath(); // box
    ctx.rect(CARTORIG_X - (CART_SIZE / 2), CARTORIG_Y - (CART_SIZE / 2), CART_SIZE, CART_SIZE);
    ctx.stroke();
    ctx.beginPath(); // y-axis
    ctx.moveTo(CARTORIG_X, CARTORIG_Y - (CART_SIZE / 2));
    ctx.lineTo(CARTORIG_X, CARTORIG_Y + (CART_SIZE / 2));
    ctx.stroke();
    ctx.beginPath();
    ctx.font = "8px Arial";
    ctx.strokeText("0,0", CARTORIG_X + 8, CARTORIG_Y + 8);
    ctx.stroke();
    ctx.beginPath(); // x-axis
    ctx.moveTo(CARTORIG_X - (CART_SIZE / 2), CARTORIG_Y);
    ctx.lineTo(CARTORIG_X + (CART_SIZE / 2), CARTORIG_Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CARTORIG_X - (CART_SIZE / 4), CARTORIG_Y);
    ctx.lineTo(CARTORIG_X - (CART_SIZE / 4), CARTORIG_Y + 5);
    ctx.strokeText("-10", CARTORIG_X - (CART_SIZE / 4) + 10, CARTORIG_Y + 8);
    ctx.stroke();
    ctx.strokeText("-20", CARTORIG_X - (CART_SIZE / 2) + 10, CARTORIG_Y + 8);
    ctx.beginPath();
    ctx.moveTo(CARTORIG_X + (CART_SIZE / 4), CARTORIG_Y);
    ctx.lineTo(CARTORIG_X + (CART_SIZE / 4), CARTORIG_Y + 5);
    ctx.strokeText("10", CARTORIG_X + (CART_SIZE / 4) - 10, CARTORIG_Y + 8);
    ctx.stroke();
    ctx.strokeText("20", CARTORIG_X + (CART_SIZE / 2) - 10, CARTORIG_Y + 8);
    ctx.beginPath();
    ctx.moveTo(CARTORIG_X , CARTORIG_Y- (CART_SIZE / 4));
    ctx.lineTo(CARTORIG_X - 5 , CARTORIG_Y - (CART_SIZE / 4));
    ctx.strokeText("10", CARTORIG_X  - 10, CARTORIG_Y - (CART_SIZE / 4) + 8);
    ctx.stroke();
    ctx.strokeText("20", CARTORIG_X - 10, CARTORIG_Y - (CART_SIZE / 2) + 8);
    ctx.beginPath();
    ctx.moveTo(CARTORIG_X, CARTORIG_Y + (CART_SIZE / 4));
    ctx.lineTo(CARTORIG_X -5, CARTORIG_Y + (CART_SIZE / 4));
    ctx.strokeText("-10", CARTORIG_X - 10, CARTORIG_Y + (CART_SIZE / 4) - 8);
    ctx.stroke();
    ctx.strokeText("-20", CARTORIG_X - 10, CARTORIG_Y + (CART_SIZE / 2) - 8);
}

initTracker();
initToDo();
canv.onmousedown = sbDrag;
canv.onmouseup = sbDrop;
