Promise.all([
    fetch('../json_files/chart1_2_jour.json').then(res => res.json()),
    fetch('../json_files/chart1_2_mois.json').then(res => res.json())
]).then(([dataJour, dataMois]) => {
    window.chart1_2_data = {
        jour: dataJour,
        mois: dataMois
    };

    const labels = dataMois.map(item => item.mois);
    const ages = Object.keys(dataMois[0]).filter(k => k !== 'mois');

    const datasets = ages.map((age, index) => ({
        label: `Âge ${age}`,
        data: dataMois.map(item => item[age]),
        borderColor: `hsl(${(index * 360) / ages.length}, 70%, 50%)`,
        fill: false
    }));
    // Global variables used for sliders
    window.chart1_2_data = {
        jour: dataJour,
        mois: dataMois,
        maxJour: 450,
        maxMois: 6000
    };


    new Chart(document.getElementById('Chart1_2'), {
        type: 'line',
        data: { labels, datasets },
        options: {
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Nombre de décès' },
                    max: window.chart1_2_data.maxMois
                },
            }
        }
    });
});