document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('Chart3_2');
    if (!ctx) return;

    fetch('../json_files/chart3_2.json')
        .then(res => res.json())
        .then(data => {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.region),
                    datasets: [{
                        label: 'Décès cumulés',
                        data: data.map(d => d.dc),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
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