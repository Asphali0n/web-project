fetch('../json_files/chart1_1.json')
    .then(response => response.json())
    .then(data => {
        // 2. Extraction des listes pour les axes du graphique
        const labels = Object.values(data.cl_age90).map(age => age === 90 ? '90+ ans' : `${age - 9}-${age} ans`);
        const donneesMort = Object.values(data.dc);
        const donneesEnVie = Object.values(data.rad)

        // 3. Configuration de Chart.js
        const ctx1 = document.getElementById('Chart1_1');

        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Décès (cumulés)",
                    data: donneesMort, // Utilise la variable "donneesMort"
                    backgroundColor: 'rgba(72, 18, 163, 0.62)',
                    yAxisID: "y"
                },
                {
                    label: "Retours à domicile (cumulés)",
                    data: donneesEnVie, // Utilise la variable "donneesEnVie"
                    backgroundColor: 'rgba(255, 200, 0, 0.63)',
                    yAxisID: "y1"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Nombre de décès' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false }, // Ne pas superposer les lignes de grille
                        title: { display: true, text: 'Nombre de retours à domicile' }
                    }
                }
            }
        });
    });