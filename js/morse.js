"use strict"

class Sound {
    constructor(src, maxStreams = 1, vol = 1.0) {
        this.maxStreams = maxStreams;
        this.streamNum = 0;
        this.streams = [];
        for (var i = 0; i < this.maxStreams; i++) {
            this.streams.push(new Audio(src));
            this.streams[i].volume = vol;
        }
    }
    
    play() {
        this.streamNum = (this.streamNum + 1) % this.maxStreams;
        this.streams[this.streamNum].play();
    }
    
    stop() {
        this.streams[this.streamNum].pause();
        this.streams[this.streamNum].currentTime = 0;
    }
}

class Morse {
            
    constructor() {
        this.DPS = 400/60; // Dits per second (500 per minute works, but 400 works better, though slightly slower)
        this.transmitting;
        this.receive_message = [];
        this.transmit_message = "";
        this.tx_index = 0;
        this.fxDit = new Sound("./sfx/dit.mp3", 1, 0.5);
        this.fxDah = new Sound("./sfx/dah.mp3", 1, 0.5);
        this.DIT = [1,0];
        this.DAH = [1,1,1,0];
        this.SEPARATOR = [0,0];
    }
    
    static decoder(str) {
        let input = str;
        let output = "";
        let words_output = input.replace(/0000000/g, "0, ,"); //word break
        let letters_output = words_output.replace(/000/g, "0,"); //letter break
        let dahs_output = letters_output.replace(/1110/g, "dah"); //decode the dahs
        let dits_output = dahs_output.replace(/10/g, "dit"); //decode the dits
        let word_list = dits_output.split(","); //make a list of letters
        for (let i = 0; i < word_list.length; i++) {
            switch(word_list[i]) {
                case "ditdah":
                    output += "a";
                    break;
                case "dahditditdit":
                    output += "b";
                    break;
                case "dahditdahdit":
                    output += "c";
                    break;
                case "dahditdit":
                    output += "d";
                    break;
                case "dit":
                    output += "e";
                    break;
                case "ditditdahdit":
                    output += "f";
                    break;
                case "dahdahdit":
                    output += "g";
                    break;
                case "ditditditdit":
                    output += "h";
                    break;
                case "ditdit":
                    output += "i";
                    break;
                case "ditdahdahdah":
                    output += "j";
                    break;
                case "dahditdah":
                    output += "k";
                    break;
                case "ditdahditdit":
                    output += "l";
                    break;
                case "dahdah":
                    output += "m";
                    break;
                case "dahdit":
                    output += "n";
                    break;
                case "dahdahdah":
                    output += "o";
                    break;
                case "ditdahdahdit":
                    output += "p";
                    break;
                case "dahdahditdah":
                    output += "q";
                    break;
                case "ditdahdit":
                    output += "r";
                    break;
                case "ditditdit":
                    output += "s";
                    break;
                case "dah":
                    output += "t";
                    break;
                case "ditditdah":
                    output += "u";
                    break;
                case "ditditditdah":
                    output += "v";
                    break;
                case "ditdahdah":
                    output += "w";
                    break;
                case "dahditditdah":
                    output += "x";
                    break;
                case "dahditdahdah":
                    output += "y";
                    break;
                case "dahdahditdit":
                    output += "z";
                    break;
                case "ditdahditdahditdah":
                    output += ".";
                    break;
                case "dahdahditditdahdah":
                    output += ",";
                    break;
                default:
                    output += " ";
                    break;
            }
        }
        return output;
    }
    
    static encoder(str) {
        let input = str.toString().toLowerCase();
        let output = [0];
        let dit = [1, 0];
        let dah = [1, 1, 1, 0];
        let separator = [0, 0];
        for (let i = 0; i < input.length; i++) {
            switch (input[i]) {
                case "a":
                    output = output.concat(dit, dah);
                    break;
                case "b":
                    output = output.concat(dah, dit, dit, dit);
                    break;
                case "c":
                    output = output.concat(dah, dit, dah, dit);
                    break;
                case "d":
                    output = output.concat(dah, dit, dit);
                    break;
                case "e":
                    output = output.concat(dit);
                    break;
                case "f":
                    output = output.concat(dit, dit, dah, dit);
                    break;
                case "g":
                    output = output.concat(dah, dah, dit);
                    break;
                case "h":
                    output = output.concat(dit, dit, dit, dit);
                    break;
                case "i":
                    output = output.concat(dit, dit);
                    break;
                case "j":
                    output = output.concat(dit, dah, dah, dah);
                    break;
                case "k":
                    output = output.concat(dah, dit, dah);
                    break;
                case "l":
                    output = output.concat(dit, dah, dit, dit);
                    break;
                case "m":
                    output = output.concat(dah, dah);
                    break;
                case "n":
                    output = output.concat(dah, dit);
                    break;
                case "o":
                    output = output.concat(dah, dah, dah);
                    break;
                case "p":
                    output = output.concat(dit, dah, dah, dit);
                    break;
                case "q":
                    output = output.concat(dah, dah, dit, dah);
                    break;
                case "r":
                    output = output.concat(dit, dah, dit);
                    break;
                case "s":
                    output = output.concat(dit, dit, dit);
                    break;
                case "t":
                    output = output.concat(dah);
                    break;
                case "u":
                    output = output.concat(dit, dit, dah);
                    break;
                case "v":
                    output = output.concat(dit, dit, dit, dah);
                    break;
                case "w":
                    output = output.concat(dit, dah, dah);
                    break;
                case "x":
                    output = output.concat(dah, dit, dit, dah);
                    break;
                case "y":
                    output = output.concat(dah, dit, dah, dah);
                    break;
                case "z":
                    output = output.concat(dah, dah, dit, dit);
                    break;
                case ".":
                    output = output.concat(dit, dah, dit, dah, dit, dah);
                    break;
                case ",":
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
    
    tx(message) {
        this.transmit_message = Morse.encoder(message);
        this.tx_index = 0;
        this.transmitting = setInterval(() => {
            if (this.tx_index < this.transmit_message.length) {
                if (this.tx_index - 1 >= 0 && 
                    this.transmit_message[this.tx_index - 1] == "0") {
                    if (this.tx_index + 1 <= this.transmit_message.length && this.transmit_message[this.tx_index] == "1" && 
                        this.transmit_message[this.tx_index + 1] == "0") {
                        this.fxDit.stop();
                        this.fxDit.play();
                    }
                    else if (this.tx_index + 3 <= this.transmit_message.length && this.transmit_message[this.tx_index] == "1" &&
                        this.transmit_message[this.tx_index + 1] == "1" && this.transmit_message[this.tx_index + 2] == "1" && this.transmit_message[this.tx_index + 3] == "0") {    
                        this.fxDah.stop();    
                        this.fxDah.play();
                    }
                    else {
                        this.fxDit.stop();
                        this.fxDah.stop();
                    }
                }
            }
            else {
                this.fxDit.stop();
                this.fxDah.stop();
                clearInterval(this.transmitting);
            }
            this.tx_index++;
        }, 1000 / this.DPS);
    }
    
    rx(blip) {
        // 0, " ", "SEPARATOR" all mean this.SEPARATOR
        // 1, ".", "DIT" all mean this.DIT
        // 2, "_", "DAH" all mean this.DAH
        // ignore everything else
            /*
            this.DIT = [1,0];
            this.DAH = [1,1,1,0];
            this.SEPARATOR = [0,0];
            */
            
        switch(blip) {
            case 0:
            case " ":
            case "SEPARATOR":
                this.receive_message = this.receive_message.concat(this.SEPARATOR);
                console.log(this.receive_message);
                break;
            case 1:
            case ".":
            case "DIT":
                this.receive_message = this.receive_message.concat(this.DIT);
                console.log(this.receive_message);
                break;
            case 2:
            case "_":
            case "DAH":
                this.receive_message = this.receive_message.concat(this.DAH);
                console.log(this.receive_message);
        }
        console.log(this.receive_message.join(""));
        return Morse.decoder(this.receive_message.join(""));
    }
    
    clear() {
        this.receive_message = [];
    }
}
