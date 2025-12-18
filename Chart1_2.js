Promise.all([
    fetch('chart1_2_jour.json').then(res => res.json()),
    fetch('chart1_2_mois.json').then(res => res.json())
]).then(([dataJour, dataMois]) => {
    const labels = dataMois.map(item => item.mois);
    const ages = Object.keys(dataMois[0]).filter(k => k !== 'mois');

    const datasets = ages.map((age, index) => ({
        label: `Âge ${age}`,
        data: dataMois.map(item => item[age]), // On pioche directement dans la colonne
        borderColor: `hsl(${(index * 360) / ages.length}, 70%, 50%)`,
        fill: false
    }));

    new Chart(document.getElementById('Chart1_2'), {
        type: 'line',
        data: { labels, datasets }
    });
});