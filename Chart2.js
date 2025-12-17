fetch('chart2.json')
    .then(response => response.json())
    .then(data => {

        const labels = Object.values(data.sexe);
        const death = Object.values(data.dc);
        const survive = Object.values(data.rad);

        const ctx2 = document.getElementById('Chart2').getContext('2d');

        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Morts par Covid-19',
                    data: death,
                },
                {
                    label: 'Survivants du Covid-19',
                    data: survive,
                }]
            }
        });
    });