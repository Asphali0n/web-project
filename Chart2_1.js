fetch('chart2_1.json')
    .then(response => response.json())
    .then(data => {

        const labels = Object.values(data.sexe).map(valeur => {
        if (valeur == 1) return "homme";
        if (valeur == 2) return "femme";
        return valeur;
    });
        const death = Object.values(data.dc);
        const survive = Object.values(data.rad);

        const ctx2 = document.getElementById('Chart2_1').getContext('2d');

        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Patients ayant succombé au Covid-19',
                    data: death,
                    backgroundColor: 'rgba(224, 77, 77, 0.44)'
                },
                {
                    label: 'Patients remis du Covid-19',
                    data: survive,
                    backgroundColor: 'rgba(126, 231, 41, 0.44)'
                }]
            }
        });
    });