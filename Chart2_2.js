fetch('chart2_2_mois.json')
    .then(response => response.json())
    .then(data => {

        
        const labels = data.map(item => item.mois);
        const sexes = Object.keys(data[0]).filter(k => k !== 'mois');

        const datasets = sexes.map((sexe, index) => ({
            label: `${sexe}`,
            data: data.map(item => item[sexe]),
            borderColor: `hsl(${(index * 360) / sexes.length}, 70%, 50%)`,
            fill: false
        }));

        new Chart(document.getElementById('Chart2_2'), {
            type: 'line',
            data: { labels, datasets }
        });
    });