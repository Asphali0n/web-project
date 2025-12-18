document.addEventListener('DOMContentLoaded', () => {

    // On cible le canvas qui est sur la page 2
    const ctx = document.getElementById('Chart3_1');
    if (!ctx) return; // Sécurité si le canvas n'existe pas

    fetch('../json_files/chart3_1.json')
        .then(response => {
            if (!response.ok) throw new Error("Fichier chart3.json introuvable !");
            return response.json();
        })
        .then(data => {
            // Récupération des données du JSON Python
            const labels = Object.keys(data.Hommes);
            const dataHommes = Object.values(data.Hommes);
            const dataFemmes = Object.values(data.Femmes);

            // Création du graphique
            new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Hommes',
                            data: dataHommes,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderWidth: 1
                        },
                        {
                            label: 'Femmes',
                            data: dataFemmes,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,

                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Nombre de décès' }
                        }
                    }
                }
            });
        })
});