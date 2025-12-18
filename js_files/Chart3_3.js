document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('Chart3_3');
    if (!ctx) return;

    fetch('../json_files/chart3_3.json')
        .then(res => res.json())
        .then(data => {
            const labels = data.map(item => item.country);
            const values = data.map(item => item.Dx_covid_season);

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56',
                            '#4BC0C0', '#9966FF', '#FF9F40'
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Décès observés (International)' },
                        legend: { position: 'right' }
                    }
                }
            });
        });
});