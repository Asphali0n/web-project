Promise.all([
    fetch('chart2_3.json').then(resp => resp.json()),
    fetch('https://france-geojson.gregoiredavid.fr/repo/departements.geojson').then(resp => resp.json())
])
    .then(([data, geoJSON]) => {
        // data parsing
        let depsList = {};

        Object.keys(data.dep).forEach(index => {
            let codeDep = data.dep[index];
            let sex = data.sexe[index];
            let deathNb = data.dc[index];
            let radNb = data.rad[index];

            if (!depsList[codeDep]) {
                depsList[codeDep] = {
                    id: codeDep,
                    dc_hommes: 0,
                    dc_femmes: 0,
                    rad_hommes: 0,
                    rad_femmes: 0
                };
            }

            if (sex === 1) {
                depsList[codeDep].dc_hommes += deathNb;
                depsList[codeDep].rad_hommes += radNb;
            } else {
                depsList[codeDep].dc_femmes += deathNb;
                depsList[codeDep].rad_femmes += radNb;
            }
        });

        // Convert to table
        let mapData = Object.values(depsList).map(dep => {
            let couleur = (dep.dc_hommes > dep.dc_femmes) ? '#42a5f5' : '#ec407a';
            return {
                id: dep.id,
                value: dep.dc_hommes + dep.dc_femmes,
                fill: couleur,

                dc_hommes: dep.dc_hommes,
                dc_femmes: dep.dc_femmes,
                rad_hommes: dep.rad_hommes,
                rad_femmes: dep.rad_femmes,

                hommes: dep.dc_hommes,
                femmes: dep.dc_femmes,
            };
        });

        window.mapDataGlobal = mapData;
        // Creating map
        let map = anychart.map();

        // Use geoJSON
        map.geoData(geoJSON);

        // Use "code" element un the geoJSON (would be too long to explain how geoJSON and AnyChart work here)
        map.geoIdField('code');

        let series = map.choropleth(mapData);
        series.tooltip().titleFormat('{%nom}');

        // Tooltip
        series.tooltip().format(function () {
            return 'Total Décès: ' + this.value +
                '\nHommes: ' + this.getData('hommes') +
                '\nFemmes: ' + this.getData('femmes');
        });

        series.stroke('white');
        series.hovered().fill('#6e7dc0ff');
        map.credits().enabled(false);
        map.background().fill("transparent")
        map.bounds(0, 0, "100%", "100%")

        // draw map
        map.container('Chart2_3');
        map.draw();

    });