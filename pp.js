
var midiOutput;
var uiChanged = function () {
    sendSysEx(getSysex(dcoStructure, dco1, dcw1), midiOutput);
}

function initializeRatesAndLevels(env) {
    // Inicializar rates del 1 al 8
    for (let i = 1; i <= 8; i++) {
        env[`rate${i}`] = 99;
        env[`level${i}`] = 99;
    }
    env.endStep = 2;

    return env;
}


var dcoStructure = {
    modulation: 'none',
    octave: 0,
    lineSelect: 11,
    detune: {
        octave: 0,
        note: 0,
        fine: 0,
        sign: 1
    }

};

var dco1 = { name: 'dco1' };
var dcw1 = { name: 'dcw1' };
var dca1 = { name: 'dca1' };

dco1.env = initializeRatesAndLevels({});
dcw1.env = initializeRatesAndLevels({});
dca1.env = initializeRatesAndLevels({});

var dco2 = { name: 'dco2' };
var dcw2 = { name: 'dcw2' };
var dca2 = { name: 'dca2' };

dco2.env = initializeRatesAndLevels({});
dcw2.env = initializeRatesAndLevels({});
dca2.env = initializeRatesAndLevels({});

// format object
const numberFormat = {
    // 'to' the formatted value. Receives a number.
    to: function (value) {
        return value.toFixed(0); // 0 decimals
    },
    // 'from' the formatted value.
    // Receives a string, should return a number.
    from: function (value) {
        return Number(value);;
    }
};

document.addEventListener('DOMContentLoaded', function () {


    function crearSlidersPaso(container, numero) {
        const containerSelector = '.' + container.name + '-env-container'
        const containerName = container.name;
        const slidersContainer = document.querySelector(containerSelector);
        const sliderGroup = document.createElement('div');
        sliderGroup.classList.add('slider-group');

        sliderGroup.innerHTML = `
            <label class="slider-label">R${numero}:</label>
            <button class="toggle-btn btn-sus-${containerName}" onclick="toggleSustain(${containerName},${numero})">S</button>
            <button class="toggle-btn btn-end-${containerName}" onclick="toggleEnd(${containerName},${numero})">E</button>
            <div class="slider-vertical" id="${containerName}Rate${numero}"></div>
            <label class="slider-label">L${numero}:</label>
            <div class="slider-vertical" id="${containerName}Level${numero}"></div>
        `;
        slidersContainer.appendChild(sliderGroup);

        const rateSlider = document.getElementById(`${containerName}Rate${numero}`);
        const levelSlider = document.getElementById(`${containerName}Level${numero}`);

        [rateSlider, levelSlider].forEach(slider => {
            noUiSlider.create(slider, {
                start: 50,
                orientation: 'vertical',
                direction: 'rtl',
                tooltips: [false],
                range: {
                    'min': 0,
                    'max': 99
                },
                format: numberFormat
            });
            slider.noUiSlider.on('set.one', function () {
                var key = slider.id.replace(/^(dco1|dcw1|dca1|dco2|dcw2|dca2)/, '').toLowerCase();
                container.env[key] = Number(this.get());
                uiChanged();

            });

        });
    }

    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dco1, i);
    }
    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dcw1, i);
    }
    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dca1, i);
    }

    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dco2, i);
    }
    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dcw2, i);
    }
    for (let i = 1; i <= 8; i++) {
        crearSlidersPaso(dca2, i);
    }

    // Activar el primer botón por defecto
    toggleDcoWaveform(dco1, 1, 1);
    toggleDcoWaveform(dco1, 2, 0);
    toggleDcoWaveform(dco2, 1, 1);
    toggleDcoWaveform(dco2, 2, 0);
    toggleModulation(1);

    toggleSustain(dco1, 1);
    toggleSustain(dcw1, 1);
    toggleSustain(dca1, 1);
    toggleEnd(dco1, 3);
    toggleEnd(dcw1, 3);
    toggleEnd(dca1, 2);

    toggleSustain(dco2, 1);
    toggleSustain(dcw2, 1);
    toggleSustain(dca2, 1);
    toggleEnd(dco2, 3);
    toggleEnd(dcw2, 3);
    toggleEnd(dca2, 2);

    toggleLine(0);



});



/*botones */
function toggleDcoWaveform(dco, oscNumber, index) {
    const selector = '.btn-' + dco.name + '-wave' + oscNumber;
    console.log(selector);
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    dco[`waveForm${oscNumber}`] = index;

    uiChanged();
}
function toggleSustain(container, index) {
    var env = container.env;
    const buttons = document.querySelectorAll('.btn-sus-' + container.name);
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index - 1);
    });
    env.sustainStep = index;
    uiChanged();
}
function toggleEnd(container, index) {
    var env = container.env;
    const buttons = document.querySelectorAll('.btn-end-' + container.name);
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index - 1);
    });
    env.endStep = index;
    uiChanged();

}

function toggleModulation(index) {
    const buttons = document.querySelectorAll('.btn-modulation');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    switch (index) {
        case 0:
            dcoStructure.modulation = 'none';
            break;
        case 1:
            dcoStructure.modulation = 'ring';
            break;
        case 2:
            dcoStructure.modulation = 'noise';
            break;
    }

    uiChanged();

}

function toggleLine(index) {
    const buttons = document.querySelectorAll('.btn-line-select');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    switch (index) {
        case 0:
            dcoStructure.lineSelect = 1;
            break;
        case 1:
            dcoStructure.lineSelect = 2;
            break;
        case 2:
            dcoStructure.lineSelect = 11;
            break;
        case 3:
            dcoStructure.lineSelect = 12;
            break;
    }

    uiChanged();

}


/* midi stuff*/

let midiAccess = null;
const select = document.getElementById('midiSelect');
const status = document.getElementById('status');

// Inicializar MIDI
if (false && navigator.requestMIDIAccess) {

    navigator.requestMIDIAccess({ sysex: true })
        .then(onMIDISuccess)
        .catch(onMIDIFailure);
} else {
    status.className = 'error';
    status.textContent = 'Tu navegador no soporta MIDI';
}

// Cuando se obtiene acceso MIDI exitosamente
function onMIDISuccess(access) {
    midiAccess = access;

    // Listar puertos disponibles
    updateDeviceList();

    // Escuchar cambios en la conexión de dispositivos
    midiAccess.onstatechange = updateDeviceList;
}

// Si hay un error al acceder a MIDI
function onMIDIFailure(error) {
    status.className = 'error';
    status.textContent = 'Error al acceder a MIDI: ' + error;
}

// Actualizar lista de dispositivos
function updateDeviceList(event) {
    // Limpiar opciones existentes excepto la primera
    while (select.options.length > 1) {
        select.options.remove(1);
    }

    // Obtener y mostrar puertos de salida
    const outputs = midiAccess.outputs.values();
    let hasDevices = false;

    for (let output of outputs) {
        hasDevices = true;
        const option = document.createElement('option');
        option.value = output.id;
        option.text = output.name + ' ' + output.id;
        select.add(option);
    }

    if (hasDevices) {
        status.className = 'info';
        status.textContent = 'Dispositivos MIDI encontrados';
    } else {
        status.className = 'info';
        status.textContent = 'No se encontraron dispositivos MIDI';
    }
}

// Manejar selección de puerto
select.addEventListener('change', function (e) {
    const selectedId = e.target.value;
    if (selectedId) {
        midiOutput = Array.from(midiAccess.outputs.values())
            .find(output => output.id === selectedId);

        status.className = 'info';
        status.textContent = `Puerto seleccionado: ${midiOutput.name} ${midiOutput.id}`;
        console.log('Puerto MIDI seleccionado:', midiOutput.name);
    } else {
        midiOutput = null;
    }
});