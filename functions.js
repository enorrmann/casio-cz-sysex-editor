const rnd = function (max) {
    return Math.floor(Math.random() * (max));
}


var sysexHeader = "F0 44 00 00 70 20"; // syex initial, last 20 is program change request
var sysexProgram = "60";  // 60 current working memory
var sysexEnd = "F7";  // sysex end

// all values are returned as "half bytes", so instead of sending 5F we send 0F 05
function splitHexValue(hexValues) {
    // Split input into individual hex values
    const hexArray = hexValues.split(' ');

    // Process each hex value and join results
    return hexArray.map(hex => {
        const cleanHex = hex.toString().toUpperCase().replace(/[^0-9A-F]/g, '');
        if (cleanHex.length !== 2) {
            //throw new Error('Each hex value must be 2 digits');
            console.error('Each hex value must be 2 digits');
            return;
        }

        const firstChar = cleanHex[0];
        const secondChar = cleanHex[1];

        return `0${secondChar} 0${firstChar}`;
    }).join(' ');
}

function getOctaveAndLineSelect(octave, lineSelect) {
    // Validate octave input
    if (![0, 1, -1].includes(octave)) {
        throw new Error("Octave must be 0, +1, or -1");
    }

    // Validate line select input
    const validLineSelects = [1, 2, 11, 12];
    if (!validLineSelects.includes(lineSelect)) {
        throw new Error("Line select must be 1, 2, 11, or 12");
    }

    // First 4 bits are always 0000
    let binaryResult = '0000';

    // Add octave bits
    switch (octave) {
        case 0:
            binaryResult += '00';
            break;
        case 1:
            binaryResult += '01';
            break;
        case -1:
            binaryResult += '10';
            break;
    }

    // Add line select bits
    switch (lineSelect) {
        case 1:
            binaryResult += '00';
            break;
        case 2:
            binaryResult += '01';
            break;
        case 11:
            binaryResult += '10';
            break;
        case 12:
            binaryResult += '11';
            break;
    }

    // Convert binary to hex
    const decimal = parseInt(binaryResult, 2);
    const hex = decimal.toString(16).padStart(2, '0').toUpperCase();

    return splitHexValue(hex);

}

function concat(...args) {
    return args.join(' ');
}

// TODO verificar valor fine
function getDetuneRange(fine, oct, note) {
    // Validate inputs
    if (fine < 0 || fine > 60) throw new Error('Fine must be between 0 and 60');
    if (oct < 0 || oct > 3) throw new Error('Octave must be between 0 and 3');
    if (note < 0 || note > 11) throw new Error('Note must be between 0 and 11');

    // Calculate first byte (fine)
    let firstByte = (fine * 4).toString(16).padStart(2, '0');

    // Calculate second byte (oct and note)
    const secondByte = (oct * 12 + note).toString(16).padStart(2, '0');
    var returnValue = firstByte.toUpperCase() + " " + secondByte.toUpperCase();
    return splitHexValue(returnValue);
}

var getVibratoWaveNumber = function (waveform) {
    const waveNumberToByte = {
        1: "08",
        2: "04",
        3: "20",
        4: "02"
    };
    return splitHexValue(waveNumberToByte[waveform]);
}

var getVibratoDelayTime = function (time) {
    return splitHexValue("00 00 00"); // TODO, 3 bytes
}

var getVibratoRate = function (time) {
    return splitHexValue("00 00 00"); // TODO, 3 bytes
}

var getVibratoDepth = function (time) {
    return splitHexValue("00 00 00"); // TODO, 3 bytes
}

function getDcoWaveform(first, second, modulation) {
    // Validación de entradas
    if (first < 0 || first > 8 || second < 0 || second > 8) {
        return "Invalid first or second waveform number. Please use numbers between 1 and 8.";
    }

    const modulationBits = {
        none: "000",
        ring: "100",
        noise: "011"
    };

    const waveforms = {
        0: "000",
        1: "000",
        2: "001",
        3: "010",
        4: "100",
        5: "101",
        6: "110",
        7: "110",
        8: "110"
    };

    if (!modulationBits[modulation]) {
        return "Invalid modulation type. Please use 'none', 'ring', or 'noise'.";
    }

    let firstBits = waveforms[first];
    let secondBits = waveforms[second];
    let waveState = second >= 1 ? "10" : "00"; // if second wave is present, 10, else 00
    let tail = "00";
    if (first == 6 || second == 6) tail = "01";
    if (first == 7 || second == 7) tail = "10";
    if (first == 8 || second == 8) tail = "11";

    // Modulación
    const modBits = modulationBits[modulation];
    const padding = "000";
    // Construcción de los bytes finales
    const binaryString = firstBits + secondBits + waveState + tail + modBits + padding;
    const byte1 = parseInt(binaryString.slice(0, 8), 2);
    const byte2 = parseInt(binaryString.slice(8, 16), 2);

    return splitHexValue(`${byte1.toString(16).toUpperCase().padStart(2, '0')} ${byte2.toString(16).toUpperCase().padStart(2, '0')}`);
}

function getDcaKeyFollow(key) {
    // Mapas para los bytes correspondientes
    const firstByteMap = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
    const secondByteMap = ["00", "08", "11", "1A", "24", "2F", "3A", "45", "52", "5F"];

    // Validación de entrada
    if (key < 0 || key > 9) {
        return "Invalid key follow value. Please use a number between 0 and 9.";
    }

    // Obtenemos los bytes correspondientes
    const firstByte = firstByteMap[key];
    const secondByte = secondByteMap[key];

    return splitHexValue(`${firstByte} ${secondByte}`);
}

function getDcwKeyFollow(key) {
    // Mapas para los bytes correspondientes
    const firstByteMap = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
    const secondByteMap = ["00", "1F", "2C", "39", "46", "53", "60", "6E", "92", "FF"];

    // Validación de entrada
    if (key < 0 || key > 9) {
        return "Invalid key follow value. Please use a number between 0 and 9.";
    }

    // Obtenemos los bytes correspondientes
    const firstByte = firstByteMap[key];
    const secondByte = secondByteMap[key];

    return splitHexValue(`${firstByte} ${secondByte}`);
}

function getEnvEnd(env) {
    var step = env.endStep;
    // Validación de entrada
    if (step < 1) {
        step = 1;
    }
    if (step > 8) {
        step = 8;
    }
    // El valor del byte es simplemente el paso menos uno en formato hexadecimal
    const byteValue = (step - 1).toString(16).toUpperCase().padStart(2, "0");

    return splitHexValue(`${byteValue}`);
}

function getDCARateAndLevel(params) {
    // Validación de sustainStep
    let sustainStep = params.sustainStep;
    if (sustainStep < 1) {
        sustainStep = 1;
    }
    if (sustainStep > 8) {
        sustainStep = 8;
    }

    // Arrays para procesar los parámetros en pares
    const rates = [params.rate1, params.rate2, params.rate3, params.rate4, params.rate5, params.rate6, params.rate7, params.rate8];
    const levels = [params.level1, params.level2, params.level3, params.level4, params.level5, params.level6, params.level7, params.level8];

    // Validación de todas las entradas
    for (let i = 0; i < 8; i++) {
        if (rates[i] < 0 || rates[i] > 99 || levels[i] < 0 || levels[i] > 99) {
            return `Invalid rate or level value at position ${i + 1}. Please use numbers between 0 and 99.`;
        }
    }

    let resultValues = [];

    // Procesamiento de cada par de rate y level
    for (let i = 0; i < 8; i++) {
        const rateHex = Math.trunc((119 * rates[i]) / 99).toString(16).toUpperCase().padStart(2, "0");

        // Ajustar el level si corresponde al sustainStep
        let adjustedLevel = levels[i];
        if (i === sustainStep - 1) {  // sustainStep - 1 porque el array es base 0
            adjustedLevel += 128;
        }

        // if DCA
        adjustedLevel += 28;

        const levelHex = (adjustedLevel).toString(16).toUpperCase().padStart(2, "0");
        const hexPair = `${rateHex} ${levelHex}`;

        // Agregar el resultado de splitHexValue al array
        resultValues.push(splitHexValue(hexPair));
    }

    // Unir todos los valores con espacios
    return resultValues.join(' ');
}


function getDCWRateAndLevel(params) {
    // Validación de sustainStep
    let sustainStep = params.sustainStep;
    if (sustainStep < 1) {
        sustainStep = 1;
    }
    if (sustainStep > 8) {
        sustainStep = 8;
    }

    // Arrays para procesar los parámetros en pares
    const rates = [params.rate1, params.rate2, params.rate3, params.rate4, params.rate5, params.rate6, params.rate7, params.rate8];
    const levels = [params.level1, params.level2, params.level3, params.level4, params.level5, params.level6, params.level7, params.level8];


    // Validación de todas las entradas
    for (let i = 0; i < 8; i++) {
        if (rates[i] < 0 || rates[i] > 99 || levels[i] < 0 || levels[i] > 99) {
            return `Invalid rate or level value at position ${i + 1}. Please use numbers between 0 and 99.`;
        }
    }

    let resultValues = [];

    // Procesamiento de cada par de rate y level
    for (let i = 0; i < 8; i++) {
        var rate = Math.trunc(((119 * rates[i])) / 99) + 8;
        if (i > 0 && levels[i - 1] > levels[i]) {
            rate += 128; // add 128 if this level is going down
        }
        const rateHex = rate.toString(16).toUpperCase().padStart(2, "0");

        // Ajustar el level si corresponde al sustainStep
        //let adjustedLevel = levels[i];
        let adjustedLevel = Math.trunc(127 * (levels[i] - 1) / 99) + 1;
        if (i === sustainStep - 1) {  // sustainStep - 1 porque el array es base 0
            adjustedLevel += 128;
        }

        const levelHex = (adjustedLevel).toString(16).toUpperCase().padStart(2, "0");
        const hexPair = `${rateHex} ${levelHex}`;

        // Agregar el resultado de splitHexValue al array
        resultValues.push(splitHexValue(hexPair));
    }

    // Unir todos los valores con espacios
    return resultValues.join(' ');
}

function getDCORateAndLevel(params) {
    // Validación de sustainStep
    let sustainStep = params.sustainStep;
    if (sustainStep < 1) {
        sustainStep = 1;
    }
    if (sustainStep > 8) {
        sustainStep = 8;
    }

    // Arrays para procesar los parámetros en pares
    const rates = [params.rate1, params.rate2, params.rate3, params.rate4, params.rate5, params.rate6, params.rate7, params.rate8];
    const levels = [params.level1, params.level2, params.level3, params.level4, params.level5, params.level6, params.level7, params.level8];


    // Validación de todas las entradas
    for (let i = 0; i < 8; i++) {
        if (rates[i] < 0 || rates[i] > 99 || levels[i] < 0 || levels[i] > 99) {
            return `Invalid rate or level value at position ${i + 1}. Please use numbers between 0 and 99.`;
        }
    }

    let resultValues = [];

    // Procesamiento de cada par de rate y level
    for (let i = 0; i < 8; i++) {
        const rate = Math.trunc(((127 * rates[i])) / 99);
        const rateHex = rate.toString(16).toUpperCase().padStart(2, "0");

        // Ajustar el level si corresponde al sustainStep
        let adjustedLevel = levels[i];
        if (adjustedLevel > 63) {
            adjustedLevel += 4;
        }
        if (i === sustainStep - 1) {  // sustainStep - 1 porque el array es base 0
            adjustedLevel += 128;
        }

        const levelHex = (adjustedLevel).toString(16).toUpperCase().padStart(2, "0");
        const hexPair = `${rateHex} ${levelHex}`;

        // Agregar el resultado de splitHexValue al array
        resultValues.push(splitHexValue(hexPair));
    }

    // Unir todos los valores con espacios
    return resultValues.join(' ');
}

var getSysex = function (dco, dcw) {
    const pitchEnv = {
        rate1: 99,
        level1: 0,
        rate2: 99,
        level2: 99,
        rate3: 99,
        level3: 99,
        rate4: 99,
        level4: 99,
        rate5: 99,
        level5: 99,
        rate6: 99,
        level6: 99,
        rate7: 99,
        level7: 99,
        rate8: 99,
        level8: 99,
        sustainStep: 2
    };
    const randomParams = {
        rate1: 99,
        level1: 99,
        rate2: 99,
        level2: 99,
        rate3: 99,
        level3: 99,
        rate4: 99,
        level4: 99,
        rate5: 99,
        level5: 99,
        rate6: 99,
        level6: 99,
        rate7: 99,
        level7: 99,
        rate8: 99,
        level8: 99,
        sustainStep: 1,
        endStep :2
    };

    const dcoEnvTest = {
        rate1: 99,
        level1: 0,
        rate2: 99,
        level2: 99,
        rate3: 99,
        level3: 99,
        rate4: 99,
        level4: 99,
        rate5: 99,
        level5: 99,
        rate6: 99,
        level6: 99,
        rate7: 99,
        level7: 99,
        rate8: 99,
        level8: 99,
        sustainStep: 1,
        endStep :2
    };

    var octaveAndLine = getOctaveAndLineSelect(0, 11); // octave, line selector 11 and 12 are 1+1 and 1+2
    var detune = splitHexValue("01"); // 00 is +, 01 is -
    var detuneRange = getDetuneRange(13, 0, 0); // fine, oct, note
    var vibratoWaveNmber = getVibratoWaveNumber(3);
    var vibTime = getVibratoDelayTime(0);

    var hex = concat(
        sysexHeader,
        sysexProgram,
        octaveAndLine,
        detune,
        detuneRange,
        vibratoWaveNmber,
        vibTime,
        getVibratoRate(0),
        getVibratoDepth(0),

        getDcoWaveform(dco.waveForm1, dco.waveForm2, 'ring'),           // dco1 waveform
        getDcaKeyFollow(1),                                             // dca1 key follow
        getDcwKeyFollow(1),                                             // dcw1 key follow

        getEnvEnd(randomParams),                                        // end step number of dca1 envelope
        getDCARateAndLevel(randomParams),                               // dca1 envelope rate/level

        getEnvEnd(dcw.env),                                             // end step number of dcw1 envelope
        getDCWRateAndLevel(dcw.env),                                    // dcw1 envelope rate/level
        getEnvEnd(dco.env),                                             // end step number of dco1 envelope
        getDCORateAndLevel(dco.env),                                    // dco1 envelope rate/level

        getDcoWaveform(dco.waveForm1, dco.waveForm1, 'ring'),
        getDcaKeyFollow(rnd(9)),
        getDcwKeyFollow(rnd(9)),
        getEnvEnd(dco.env),
        getDCARateAndLevel(randomParams),
        getEnvEnd(dco.env),
        getDCWRateAndLevel(randomParams),
        getEnvEnd(dco.env),
        getDCORateAndLevel(randomParams),
        sysexEnd


    );
    return hex;
}


// Initialize MIDI and get the first output
/*async function initializeMIDI() {
    try {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
        const outputs = midiAccess.outputs.values();
        firstOutput = outputs.next().value;
        firstOutput = outputs.next().value;

        if (!firstOutput) {
            throw new Error('No MIDI output found');
        }
        return firstOutput;
    } catch (error) {
        console.error('MIDI initialization error:', error);
        return null;
    }
}*/

// Send SysEx data to the MIDI output
async function sendSysEx(hexString,midiOutput) {
    //var midiOutput = firstOutput;
    try {
        // Convert hex string to Uint8Array
        const cleanHex = hexString.replace(/\s+/g, '');
        if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
            throw new Error('Invalid hex string');
        }

        const sysexData = new Uint8Array(
            cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        if (!midiOutput) {
            console.error('No MIDI output provided');
            return;
        }

        midiOutput.send(sysexData);
        return true;
    } catch (error) {
        console.error('SysEx send error:', error);
        return false;
    }
}

//var firstOutput;
//initializeMIDI();

