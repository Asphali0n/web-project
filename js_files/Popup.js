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
    resetModalView(); // hide everything (I swear i always have those scenarios forcing me to add a security like this)
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
    overlay.classList.add('hidden');
    if (modalChart) { modalChart.destroy(); modalChart = null; }
    if (modalMapInstance) { modalMapInstance.dispose(); modalMapInstance = null; }
}

// Function to format JSON data (it was not really usable the way it was initially)
function getFormattedMapData(mode) {
    if (!window.mapDataGlobal) return []; // Does nothing if the map is closed (because it somehow blocked everything due to an error)

    return window.mapDataGlobal.map(dep => {
        let valH = (mode === 'dc') ? dep.dc_hommes : dep.rad_hommes;
        let valF = (mode === 'dc') ? dep.dc_femmes : dep.rad_femmes;
        let total = valH + valF;
        let couleur = (valH > valF) ? '#42a5f5' : '#ec407a';

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
const sliderContainer = document.getElementById('sliderContainer');
const sliderInput = document.getElementById('modalSlider');
const sliderValueSpan = document.getElementById('sliderValue');

// chart configs
const chartConfigs = {
    'Chart3_2': {
        slider: {
            active: true,
            min: 0,
            max: 300,
            step: 5,
            default: 100,
            unit: '%',
            // Action (What you change when using slider)
            action: (chart, val) => {
                const factor = val / 100;
                // Change data based on the original
                const originalData = chart.initialDataValues;

                // Updates chart values (this is a basic multiplier)
                chart.data.datasets[0].data = originalData.map(v => v * factor);
                chart.update();
            }
        },

    }, 'Chart2_3': {
        toggle: {
            active: true,
            default: 'dc',
            // LAction
            action: (mapInstance, mode) => {
                // Calculate data based on the mode (dc/rad)
                let newData = getFormattedMapData(mode);
                // Update map
                mapInstance.getSeries(0).data(newData);
            }
        }
    },

    // Add other chart ids and configs here
};

// Function to setup controls (basically changing html attributes for sliders/toggles based on config)
function setupControls(chartId, currentChart) {
    const config = chartConfigs[chartId];

    // Hide by default
    controlsDiv.classList.add('hidden');
    sliderContainer.classList.add('hidden');
    mapToggleContainer.classList.add('hidden');

    // If no config we just stop here
    if (!config) return;

    // If config we show the control div thingy
    controlsDiv.classList.remove('hidden');

    // SLIDER (basically just changing every html attributes to how we set it in the config, because every chart will have different sliders)
    if (config.slider && config.slider.active) {
        sliderContainer.classList.remove('hidden');

        // html attributes
        sliderInput.min = config.slider.min;
        sliderInput.max = config.slider.max;
        sliderInput.step = config.slider.step || 1;
        sliderInput.value = config.slider.default;

        // Update text
        sliderValueSpan.textContent = config.slider.default + (config.slider.unit || '');

        // Update value on input
        sliderInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            sliderValueSpan.textContent = val + (config.slider.unit || '');
            config.slider.action(currentChart, val);
        };
    }

    // TOGGLE
    if (config.toggle && config.toggle.active) {
        mapToggleContainer.classList.remove('hidden');

        // Function to change style based on mode 
        const setButtonStyle = (mode) => {
            if (mode === 'dc') {
                btnDC.style.background = '#333'; btnDC.style.color = 'white';
                btnRAD.style.background = 'white'; btnRAD.style.color = 'black';
                mapToggleValue.textContent = "Décès";
            } else {
                btnRAD.style.background = '#333'; btnRAD.style.color = 'white';
                btnDC.style.background = 'white'; btnDC.style.color = 'black';
                mapToggleValue.textContent = "Retour à domicile";
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