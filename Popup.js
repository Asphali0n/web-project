const overlay = document.getElementById('overlay');
const modalCanvas = document.getElementById('modalCanvas');
const modalText = document.getElementById('modalText');
const closeBtn = document.querySelector('.close-button');

let modalChart = null;

// For each div with .chart-clickable class
document.querySelectorAll('.chart-clickable').forEach(container => {
    container.addEventListener('click', () => {
        // Search for canva inside the div
        const canvasInside = container.querySelector('canvas');
        // Get description (data-desc class)
        const desc = container.dataset.desc;

        if (canvasInside) {
            openModal(canvasInside, desc, canvasInside.id);
        }
    });
});

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
    // Keep initial values (useful for sliders but depends) TESTING
    modalChart.initialDataValues = [...originalChart.config.data.datasets[0].data];
    modalChart.initialColors = originalChart.config.data.datasets[0].backgroundColor;

    // Setup the slider config (like values, min, max etc... based on the chart id) TESTING
    setupControls(chartId, modalChart);
}

// Close modal by adding the css class "hidden" (yes, I know the chart instantly gets destroyed but i bet you didn't notice until now)
function closeModal() {
    overlay.classList.add('hidden');
    if (modalChart) {
        modalChart.destroy();
        modalChart = null;
    }
}

closeBtn.addEventListener('click', closeModal);
// This one just closes it if you click anywhere outside instead of the X button (I know you would do that)
overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});

// ========== TESTING BELOW (c juste un test pour sliders) ================


const controlsDiv = document.getElementById('modalControls');
const sliderContainer = document.getElementById('sliderContainer');
const sliderInput = document.getElementById('modalSlider');
const sliderValueSpan = document.getElementById('sliderValue');

const chartConfigs = {
    'Chart3_2': {
        slider: {
            active: true,
            min: 0,
            max: 300,
            step: 5,
            default: 100,
            unit: '%',
            // Action (like, what u change when using slider)
            action: (chart, val) => {
                const factor = val / 100;
                // If you constantly change values, you're OBVIOUSLY gonna do it based on the original one
                const originalData = chart.initialDataValues;

                // updates chart (the line above idk i forgot i gotta comment im tired)
                chart.data.datasets[0].data = originalData.map(v => v * factor);
                chart.update();
            }
        },

    }
    // Add other chart ids and configs here
};

function setupControls(chartId, currentChart) {
    const config = chartConfigs[chartId];

    // Hide by default
    controlsDiv.classList.add('hidden');
    sliderContainer.classList.add('hidden');

    // If no config we just stop here
    if (!config) return;

    // If config we show the control div thingy
    controlsDiv.classList.remove('hidden');

    // Slider (basically just changing every html attributes to how we set it in the config, because every chart will have different sliders)
    if (config.slider && config.slider.active) {
        sliderContainer.classList.remove('hidden');

        // html attributes
        sliderInput.min = config.slider.min;
        sliderInput.max = config.slider.max;
        sliderInput.step = config.slider.step || 1;
        sliderInput.value = config.slider.default;

        // Update text
        sliderValueSpan.textContent = config.slider.default + (config.slider.unit || '');

        // uhhh input shit idk its 3 am bro leave me alone
        sliderInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            sliderValueSpan.textContent = val + (config.slider.unit || '');
            config.slider.action(currentChart, val);
        };
    }
}