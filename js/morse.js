const DSP = 500 / 60 // Dits per second

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

function morse_encoder(str) {
    let input = str.toString().toLowerCase();
    let output = [];
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

let morse = {

    receive_message = [],
    transmit_message = "",
    dit = [1, 0],
    dah = [1, 1, 1, 0],
    separator = [0, 0],

    encoder = morse_encoder,
    decoder = morse_decoder,

    rx = function (blip) {
        if (blip == "clear") {
            receive_message = [];
        }
        else {
            receive_message.concat(blip);
        }

        return decoder(receive_message.join(""));
    },

    tx = function (message) {
        transmit_message = encoder(message);
    },

    start = function () {
        if (transmit_message.length > 0) {
            if (!transmitting) {
                setInterval(nextInSequence, DPS/1000);
            }
        }
    },

    nextInSequence = function () {

    }
    
};
