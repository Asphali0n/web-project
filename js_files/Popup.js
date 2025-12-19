const overlay = document.getElementById('overlay');
const modalCanvas = document.getElementById('modalCanvas');
const modalText = document.getElementById('modalText');
const closeBtn = document.querySelector('.close-button');
const modalMap = document.getElementById('modalMap');

// Those 4 consts are only used for the map chart
const mapToggleContainer = document.getElementById('mapToggleContainer');
const btnDC = document.getElementById('btnDC');
const btnRAD = document.getElementById('btnRAD');
const mapToggleValue = document.getElementById('mapToggleValue');

let modalChart = null;
let modalMapInstance = null;


// For each div with .chart-clickable class
document.querySelectorAll('.chart-clickable').forEach(container => {
    container.addEventListener('click', () => {

        // Get description (data-desc class)
        const desc = container.dataset.desc;
        // Checks if it is a map
        if (container.querySelector('#Chart2_3')) {
            openModalMap(desc, 'Chart2_3');
        }
        // Checks if it is a canva
        else {
            const canvasInside = container.querySelector('canvas');
            if (canvasInside) {
                openModal(canvasInside, desc, canvasInside.id);
            }
        }
    });
});

// Function to open and show the popup with the canva/map, desc, and id
function openModal(sourceCanvas, description, chartId) {
    // Get the chart instance of the source (the one you clicked)
    const originalChart = Chart.getChart(sourceCanvas);

    // Show overlay
    overlay.classList.remove('hidden');
    modalCanvas.style.display = 'block';
    modalText.textContent = description;

    // Delete old chart if it still exists
    if (modalChart) modalChart.destroy();

    // Deep copy (because if we use sliders, we need to avoid the original from getting changed)
    const chartDataCopy = JSON.parse(JSON.stringify(originalChart.config.data));

    // Create new chart (basically copy the original one)
    modalChart = new Chart(modalCanvas.getContext('2d'), {
        type: originalChart.config.type,
        data: chartDataCopy,
        options: {
            ...originalChart.config.options,
            responsive: true,
            maintainAspectRatio: false // Put this on true and you'll regret it (false = allows it to scale correctly in the new parent)
        }
    });
    // Keep initial values (for sliders)
    modalChart.initialDataValues = [...originalChart.config.data.datasets[0].data];
    modalChart.initialColors = originalChart.config.data.datasets[0].backgroundColor;

    // Setup the slider config (like values, min, max etc... based on the chart id)
    setupControls(chartId, modalChart);
}

function openModalMap(description, chartId) {
    resetModalView(); // hide everything (The map gets resized weirdly if i delete this)
    modalMap.style.display = 'block'; // Show map div
    modalMap.style.width = '100%';
    modalMap.style.height = '100%';
    // Show overlay and description
    overlay.classList.remove('hidden');
    modalText.textContent = description;

    // Delete old map
    if (modalMapInstance) {
        modalMapInstance.dispose();
        modalMapInstance = null;
    }

    // Create new map
    modalMapInstance = anychart.map();

    // Get geoJSON for the map (basically how the library will recognize "oh, this is france" and shows france)
    if (window.mapGeoJSON) {
        modalMapInstance.geoData(window.mapGeoJSON);
    }

    // Get department field (it is called "code" in the geoJSON)
    modalMapInstance.geoIdField('code');

    // Formatting data
    let initialData = getFormattedMapData('dc');
    let series = modalMapInstance.choropleth(initialData);

    // Style
    series.stroke('white');
    series.hovered().fill('#c3c3c3ff');
    series.tooltip().titleFormat('{%nom}');
    series.tooltip().format(function () {
        return `Total: ${this.value}\nHommes: ${this.getData('hommes')}\nFemmes: ${this.getData('femmes')}`;
    });

    // Special options (for map charts only)
    modalMapInstance.credits().enabled(false);
    modalMapInstance.background().fill("transparent");
    modalMapInstance.interactivity().zoomOnMouseWheel(true);

    modalMapInstance.container('modalMap');
    modalMapInstance.draw();

    // Setup controls
    setupControls(chartId, modalMapInstance);
}

// Function to completely hide modal
function resetModalView() {
    modalCanvas.style.display = 'none';
    modalMap.style.display = 'none';
}

// Function to close modal by adding the css class "hidden" (yes, I know the chart instantly gets destroyed but i bet you didn't notice until now)
function closeModal() {
    if (modalChart) { modalChart.destroy(); modalChart = null; }
    if (modalMapInstance) { modalMapInstance.dispose(); modalMapInstance = null; }
    overlay.classList.add('hidden');
}

// Function to format JSON data (it was not really usable the way it was initially)
function getFormattedMapData(mode) {
    if (!window.mapDataGlobal) return []; // Does nothing if the map is closed (because it somehow blocked everything due to an error)

    return window.mapDataGlobal.map(dep => {
        let valH = (mode === 'dc') ? dep.dc_hommes : dep.rad_hommes;
        let valF = (mode === 'dc') ? dep.dc_femmes : dep.rad_femmes;
        let total = valH + valF;
        let couleur = (valH > valF) ? '#62b8ffff' : '#ff4b87';

        return {
            id: dep.id,
            value: total,
            fill: couleur,
            hommes: valH,
            femmes: valF
        };
    });
}


// Close button
closeBtn.addEventListener('click', closeModal);
// This one just closes it if you click anywhere outside instead of the X button (I know you would do that)
overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});

// ========== SLIDERS/TOGGLES AND CONFIGS ================

const controlsDiv = document.getElementById('modalControls');
const slidersParent = document.getElementById('slidersParent');

const sliderContainer = document.getElementById('sliderContainer');
const sliderInput = document.getElementById('modalSlider');
const sliderValueSpan = document.getElementById('sliderValue');

const sliderContainer2 = document.getElementById('sliderContainer2');
const sliderInput2 = document.getElementById('modalSlider2');
const sliderValueSpan2 = document.getElementById('sliderValue2');

const sliderContainer3 = document.getElementById('sliderContainer3');
const sliderInput3 = document.getElementById('modalSlider3');
const sliderValueSpan3 = document.getElementById('sliderValue3');

// chart configs
const chartConfigs = {
    'Chart1_2': {
        // SLIDER 1 : Zoom
        slider: {
            active: true,
            min: 5, max: 100, step: 5, default: 100, unit: '%', // Min 5% pour éviter d'avoir 0 données
            action: (chart) => updateChart1_2(chart)
        },
        // SLIDER 2 : Tick size (or precision)
        slider2: {
            active: true,
            min: 1, max: 35, step: 1, default: 35,
            action: (chart) => updateChart1_2(chart)
        },
        // SLIDER 3 : Start date
        slider3: {
            active: true,
            min: 0, max: 100, step: 1, default: 0, // Le max sera mis à jour dynamiquement
            action: (chart) => updateChart1_2(chart)
        }
    }, 'Chart2_3': {
        toggle: {
            active: true,
            default: 'dc',
            // Action
            action: (mapInstance, mode) => {
                // Calculate data based on the mode (dc/rad)
                let newData = getFormattedMapData(mode);
                // Update map
                mapInstance.getSeries(0).data(newData);
            }
        }
    },
};

function updateChart1_2(chart) {
    // Get values for the first 2 sliders, the third one will change
    const rangeVal = parseInt(document.getElementById('modalSlider').value); // % d'échantillon
    const precisionVal = parseInt(document.getElementById('modalSlider2').value); // Précision
    let startIndex = parseInt(sliderInput3.value);

    let sourceData;
    let labelKey;

    // If input > 29, we switch on the month based data
    if (precisionVal > 29) {
        sourceData = window.chart1_2_data.mois;
        labelKey = 'mois';
        document.getElementById('sliderValue2').textContent = "Mois";
    } else {
        // if not, we swith on day based data
        // We keep one line out of x lines (x being the precision input)
        sourceData = window.chart1_2_data.jour.filter((_, index) => index % precisionVal === 0);
        labelKey = 'jour';

        let texte = (precisionVal === 1) ? "Tous les jours" : `Tous les ${precisionVal} jours`;
        document.getElementById('sliderValue2').textContent = texte;
    }

    // Get total json length
    const totalPoints = sourceData.length;

    // Number of points to show (minimum 2)
    const pointsToShow = Math.max(2, Math.ceil(totalPoints * (rangeVal / 100)));

    // Get the max index we can start at (if we show 20 out of 100 total, we can start at 80 max)
    const maxStartIndex = Math.max(0, totalPoints - pointsToShow);

    // Change 3rd slider's max
    sliderInput3.max = maxStartIndex;

    // Bring it back to max if it is above
    if (startIndex > maxStartIndex) {
        startIndex = maxStartIndex;
        // Update the value because it gets stuck on the right somehow
        sliderInput3.value = maxStartIndex;
    }

    // Show start date
    if (sourceData[startIndex]) {
        document.getElementById('sliderValue3').textContent = sourceData[startIndex][labelKey];
    }

    // Slicing (we basically use the start and end index to cut it there)
    const endIndex = startIndex + pointsToShow;
    const finalData = sourceData.slice(startIndex, endIndex);

    chart.data.labels = finalData.map(item => item[labelKey]);

    // This basically loads data when you move sliders
    chart.data.datasets.forEach(dataset => {
        // We're just deleting "Age" to get the key
        const ageKey = dataset.label.replace('Âge ', '');
        dataset.data = finalData.map(item => item[ageKey]);
    });

    // Fix y axis
    if (labelKey === 'mois') {
        chart.options.scales.y.max = window.chart1_2_data.maxMois;
    } else {
        chart.options.scales.y.max = window.chart1_2_data.maxJour;
    }

    chart.update();
}

// Function to setup controls (basically changing html attributes for sliders/toggles based on config)
function setupControls(chartId, currentChart) {
    const config = chartConfigs[chartId];

    // Hide by default
    controlsDiv.classList.add('hidden');
    slidersParent.classList.add('hidden');
    sliderContainer.classList.add('hidden');
    sliderContainer2.classList.add('hidden');
    sliderContainer3.classList.add('hidden');
    mapToggleContainer.classList.add('hidden');

    // If no config we just stop here
    if (!config) return;

    // If config we show the control div thingy
    controlsDiv.classList.remove('hidden');

    // SLIDER (basically just changing every html attributes to how we set it in the config, because every chart will have different sliders)
    if (config.slider && config.slider.active) {
        slidersParent.classList.remove('hidden');
        sliderContainer.classList.remove('hidden');
        sliderInput.min = config.slider.min;
        sliderInput.max = config.slider.max;
        sliderInput.step = config.slider.step;
        sliderInput.value = config.slider.default;
        sliderValueSpan.textContent = config.slider.default + (config.slider.unit || '');

        sliderInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            sliderValueSpan.textContent = val + (config.slider.unit || '');
            // Note : pour Chart1_2, l'action ignore "val" car elle relit les deux sliders direct
            config.slider.action(currentChart, val);
        };
    }

    // SLIDER 2
    if (config.slider2 && config.slider2.active) {
        slidersParent.classList.remove('hidden');
        sliderContainer2.classList.remove('hidden');
        sliderInput2.min = config.slider2.min;
        sliderInput2.max = config.slider2.max;
        sliderInput2.step = config.slider2.step;
        sliderInput2.value = config.slider2.default;

        // Start action once to put the right value
        config.slider2.action(currentChart, config.slider2.default);

        sliderInput2.oninput = (e) => {
            const val = parseInt(e.target.value);
            config.slider2.action(currentChart, val);
        };
    }
    // SLIDER 3
    if (config.slider3 && config.slider3.active) {
        slidersParent.classList.remove('hidden');
        sliderContainer3.classList.remove('hidden');

        sliderInput3.min = config.slider3.min;
        sliderInput3.step = config.slider3.step;
        sliderInput3.value = config.slider3.default;
        sliderValueSpan3.textContent = "Début";

        // Start action once to put the right value
        config.slider3.action(currentChart, 0); // i had setTimeout(() => here because it broke once but i've never seen it break again so...

        sliderInput3.oninput = (e) => {
            const val = parseInt(e.target.value);
            config.slider3.action(currentChart, val);
        };
    }

    // TOGGLE
    if (config.toggle && config.toggle.active) {
        mapToggleContainer.classList.remove('hidden');

        // Function to change style based on mode 
        const setButtonStyle = (mode) => {
            if (mode === 'dc') {
                btnDC.style.background = '#c6c6c6';
                btnRAD.style.background = 'white';
                mapToggleValue.textContent = "Décès";
                btnDC.classList.add('selected');
                btnRAD.classList.remove('selected');
            } else {
                btnRAD.style.background = '#c6c6c6';
                btnDC.style.background = 'white';
                mapToggleValue.textContent = "Retour à domicile";
                btnDC.classList.remove('selected');
                btnRAD.classList.add('selected');
            }
        };

        // Reset to default state
        setButtonStyle(config.toggle.default);

        // On click on dc
        btnDC.onclick = () => {
            setButtonStyle('dc');
            config.toggle.action(currentChart, 'dc');
        };

        // On click on rad
        btnRAD.onclick = () => {
            setButtonStyle('rad');
            config.toggle.action(currentChart, 'rad');
        };
    }
}