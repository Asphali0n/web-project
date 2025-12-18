fetch('../json_files/chart2_2.json')
    .then(response => response.json())
    .then(data => {

        const labels = data.map(item => item.mois);
        const sexes = Object.keys(data[0]).filter(k => k !== 'mois');

        const labelsMap = {
            '1': 'Homme',
            '2': 'Femme'
        };

        const datasets = sexes.map((sexe, index) => ({
            // On utilise la correspondance si elle existe, sinon on garde la valeur d'origine
            label: labelsMap[sexe] || sexe,
            data: data.map(item => item[sexe]),
            fill: false
        }));

        new Chart(document.getElementById('Chart2_2'), {
            type: 'line',
            data: { labels, datasets },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Nombre de décès' }
                    }
                }
            }
        });
    });