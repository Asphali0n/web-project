fetch('chart2_1.json')
    .then(response => response.json())
    .then(data => {

        
        const sexes = Object.values(data.sexe);
        const deaths = Object.values(data.dc);  
        const survives = Object.values(data.rad);

        // New variables to reorganize by death and survivors
        let hommeDeath, hommeSurvive, femmeDeath, femmeSurvive;

        sexes.forEach((valeurSexe, index) => {
            if (valeurSexe == 1) {
                hommeDeath = deaths[index];
                hommeSurvive = survives[index];
            } else if (valeurSexe == 2) {
                femmeDeath = deaths[index];
                femmeSurvive = survives[index];
            }
        });

        const ctx = document.getElementById('Chart2_1').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                
                labels: ['Patients ayant succombé au Covid-19', 'Patients remis du Covid-19'],
                datasets: [
                    {
                        
                        label: 'Hommes',
                        
                        data: [hommeDeath, hommeSurvive],
                        backgroundColor: 'rgba(54, 162, 235, 0.50)',
                    },
                    {
                        // Second jeu de données : Les Femmes
                        label: 'Femmes',
                        // Données : [Mort Femme, Survie Femme]
                        data: [femmeDeath, femmeSurvive],
                        backgroundColor: 'rgba(255, 99, 132, 0.50)'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });