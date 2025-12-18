// Chart3_2.js

// Données simples pour le test
const rawData3_2 = {
    labels: ['Produit A', 'Produit B', 'Produit C'],
    values: [100, 200, 150] // Valeurs de base
};

const ctx3_2 = document.getElementById('Chart3_2').getContext('2d');

// On stocke l'instance dans une variable globale ou accessible pour pouvoir la cloner plus tard
window.chart3_2_Instance = new Chart(ctx3_2, {
    type: 'bar',
    data: {
        labels: rawData3_2.labels,
        datasets: [{
            label: 'Ventes Test',
            data: rawData3_2.values,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } }
    }
});