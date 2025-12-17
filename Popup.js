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
            openModal(canvasInside, desc);
        }
    });
});

function openModal(sourceCanvas, description) {
    // Get the chart instance of the source (the one you clicked)
    const originalChart = Chart.getChart(sourceCanvas);

    if (!originalChart) {
        console.error("No chart found.");
        return;
    }

    // Show overlay
    overlay.classList.remove('hidden');
    modalText.textContent = description;

    // Delete old chart if it still exists
    if (modalChart) modalChart.destroy();

    // Create new chart (basically copy the original one)
    modalChart = new Chart(modalCanvas.getContext('2d'), {
        type: originalChart.config.type,
        data: originalChart.config.data,
        options: {
            ...originalChart.config.options,
            responsive: true,
            maintainAspectRatio: false // Put this on true and you'll regret it (false = allows it to scale correctly in the new parent)
        }
    });
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