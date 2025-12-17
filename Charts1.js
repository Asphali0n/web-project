fetch('Valve_Player_mean.json')
    .then(response => response.json())
    .then(data => {
        // Mettre Game_Name et Avg_players dans un seul tableau [{name, avg}, ...]
        const entries = Object.keys(data.Game_Name).map(i => ({
            name: data.Game_Name[i],
            avg: Number(data.Avg_players[i]),
            peak: Number(data.Peak_Players[i])
        }));
        // Trier par avg decroissant
        entries.sort((a, b) => b.avg - a.avg);

        // Prendre le top 10 et calculer le seuil (= avg du 10e)
        const top10 = entries.slice(0, 10);
        const cutoff = top10[top10.length - 1].avg;

        // Regrouper le reste et calculer leur moyenne
        const rest = entries.slice(10);
        const restAvg = rest.reduce((a, b) => a + b.avg, 0) / rest.length;
        const restPeak = rest.reduce((a, b) => a + b.peak, 0) / rest.length;

        // Construire labels + data

        const shortNames = {
            "Tom Clancy's Rainbow Six Seige": "R6",
            "NARAKA: BLADEPOINT": "NARAKA",
            "PUBG: Battlegrounds": "PUBG",
            "Grand Theft Auto V": "GTA V",
            "Team Fortress 2": "TF2",
            "Counter Strike: Global Offensive": "CS:GO"
        };

        const labels = top10.map(e => shortNames[e.name] || e.name);
        const avgPlayers = top10.map(e => e.avg);
        const peakPlayers = top10.map(e => e.peak);

        labels.push(`${rest.length} Autres (< ${Math.round(cutoff).toLocaleString('fr-FR')})`);
        avgPlayers.push(restAvg);
        peakPlayers.push(restPeak);

        labels.reverse();
        avgPlayers.reverse();
        peakPlayers.reverse();

        const ctx1 = document.getElementById('ChartAvgvsPeak');

        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Nombre de joueurs moyen",
                    data: avgPlayers,
                    borderWidth: 1,
                    yAxisID: "y"
                },
                {
                    label: "Pic de joueurs",
                    data: peakPlayers,
                    borderWidth: 1,
                    yAxisID: "y1"
                }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                if (value >= 1_000_000)
                                    return (value / 1_000_000).toFixed(1) + 'M';  // Millions
                                if (value >= 1_000)
                                    return (value / 1_000).toFixed(1) + 'K';      // Milliers
                                return value; // petit nombre
                            }
                        },
                        title: {
                            display: true,
                            text: 'Moyenne de joueurs'
                        },
                    },
                    y1: {
                        beginAtZero: true,
                        position: "right",
                        grid: { drawOnChartArea: false },
                        ticks: {
                            callback: function (value) {
                                if (value >= 1_000_000)
                                    return (value / 1_000_000).toFixed(1) + 'M';  // Millions
                                if (value >= 1_000)
                                    return (value / 1_000).toFixed(1) + 'K';      // Milliers
                                return value; // petit nombre
                            }
                        },
                        title: {
                            display: true,
                            text: 'Pic de joueurs'
                        },
                    }
                }
            }
        });
    });

fetch('games_clean.json')
    .then(response => response.json())
    .then(data => {

        // On récupère les noms de jeux (pour les labels du hover)
        const labels = Object.values(data.Name);

        // On récupère les deux séries de données
        const avgForever = Object.values(data["Average playtime forever"]);
        const avgTwoWeeks = Object.values(data["Average playtime two weeks"]);

        // On crée les points x, y
        const points = avgForever.map((val, i) => ({
            x: val,
            y: avgTwoWeeks[i],
            label: labels[i]
        }));

        const ctx2 = document.getElementById('ChartAvgTime');

        // Création du scatter plot
        new Chart(ctx2, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Temps de jeu (2 semaines vs total)',
                    data: points,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const label = ctx.raw.label;
                                const x = ctx.raw.x;
                                const y = ctx.raw.y;
                                return `${label}: ${x} min total, ${y} min / 2 semaines`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Moyenne du temps de jeu totale (minutes)'
                        },
                        beginAtZero: true,
                        max: 39000,
                        ticks: {
                            maxTicksLimit: 10,
                            stepSize: 60,
                            callback: function (value) {
                                if (value >= 60) {
                                    const hours = value / 60;
                                    return hours.toFixed(1) + 'h';
                                } else {
                                    return value + 'm';
                                }
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Moyenne du temps de jeu sur 2 semaines (minutes)'
                        },
                        beginAtZero: true,
                        max: 3600,
                        ticks: {
                            maxTicksLimit: 10,
                            stepSize: 60,
                            callback: function (value) {
                                if (value >= 60) {
                                    const hours = value / 60;
                                    return hours.toFixed(1) + 'h';
                                } else {
                                    return value + 'm';
                                }
                            }
                        }
                    }
                }
            }
        });
    });

Promise.all([
    fetch('dota.json').then(res => res.json()),
    fetch('pubg.json').then(res => res.json())
]).then(([data1, data2]) => {

    // Récupération des données
    const labels = Object.values(data2.Month_Year);
    const peakDotaPlayers = Object.values(data1.Peak_Players);
    const peakPubgPlayers = Object.values(data2.Peak_Players);
    labels.reverse()

    peakDotaPlayers.reverse()
    peakPubgPlayers.reverse()

    const slicedDota = peakDotaPlayers.slice(-55)

    const ctx2 = document.getElementById('ChartPUBGvsDota');

    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nombre de joueurs sur Dota 2',
                    data: slicedDota,
                    borderWidth: 1,
                    borderColor: 'blue',
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    fill: false
                },
                {
                    label: 'Nombre de joueurs sur PUBG',
                    data: peakPubgPlayers,
                    borderWidth: 1,
                    borderColor: 'orange',
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        callback: function (value, index) {
                            const label = this.getLabelForValue(value);
                            const yearMatch = label.match(/\b\d{4}\b/);
                            const year = yearMatch[0];

                            // afficher le label pour le début de chaque année
                            if (label.includes("Jan")) return year;
                            if (index === 0) return year;
                            return '';
                        },
                        maxRotation: 0,
                        autoSkip: false
                    },
                    grid: {
                        // affiche une ligne verticale que si le label n’est pas vide
                        color: function (context) {
                            const label = context.tick.label;
                            return label && label !== '' ? 'rgba(0,0,0,0.1)' : 'transparent';
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            if (value >= 1_000_000)
                                return (value / 1_000_000).toFixed(1) + 'M';  // Millions
                            if (value >= 1_000)
                                return (value / 1_000).toFixed(1) + 'K';      // Milliers
                            return value; // petit nombre
                        }
                    },
                    title: {
                        display: true,
                        text: 'Nombre de joueurs'
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        // garder info complète dans le tooltip
                        title: function (context) {
                            return context[0].label; // montre "March 2020", etc.
                        },
                        label: function (context) {
                            return `${context.formattedValue} joueurs`;
                        }
                    }
                }
            }
        }
    });
});