fetch('chart2.json')
    .then(response => response.json())
    .then(data => {
        // --- TOUT SE PASSE ICI ---

        // 2. On prépare les tableaux (Changez 'date' et 'valeur' par VOS clés du JSON)
        // Exemple : si votre JSON est [{ "date": "2023", "players": 500 }, ...]
        const labels = data.map(item => item.sexe);
        const death = data.map(item => item.dc);
        const survive = data.map(item => item.rad)

        // 3. On crée le graphique ICI
        const ctx = document.getElementById('monGraphique').getContext('2d');
        
        new Chart(ctx, {
            type: 'line', // ou 'bar'
            data: {
                labels: mesLabels,
                datasets: [{
                    label: 'Moyenne Joueurs Valve',
                    data: mesDonnees,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        });
    })
    .catch(error => {
        // C'est ici qu'on gère les erreurs si le fichier n'est pas trouvé
        console.error("Erreur de chargement du JSON :", error);
    });