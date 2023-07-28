import Papa from 'papaparse';

new Vue({
  el: '#app',
  data: {
    csvData: [], // Hier worden de gegevens uit de CSV opgeslagen
    availableNames: [], // Array voor alleen de namen
    selectedNames: [],
    groupedData: [], // Array voor het gegroepeerde teamdata
  },
  methods: {
    async fetchCSVData() {
      try {
        const response = await fetch('data.csv'); // Het pad naar het CSV-bestand
        const csvText = await response.text();
        this.csvData = Papa.parse(csvText, { header: true }).data;

        // Bouw een hulplijst met unieke teamnamen
        const uniqueTeams = [...new Set(this.csvData.map(item => item.team_name))];

        // Groepeer de data per team
        this.groupedData = uniqueTeams.map(teamName => ({
          team: teamName,
          riders: this.csvData.filter(item => item.team_name === teamName),
        }));

        // Bouw een hulplijst met beschikbare rider_names
        this.availableNames = this.csvData.map(item => item.rider_name);

        console.log('Grouped Data:', this.groupedData);
      } catch (error) {
        console.error('Fout bij het ophalen van CSV-gegevens:', error);
      }
    },
    submitSelection() {
        if (this.selectedNames.length !== 10) {
            alert('Selecteer exact 10 namen voordat je ze verstuurt.');
            return;
          }
    },
    resetSelection() {
        this.selectedNames = [];
    },
  },
  watch: {
    selectedNames: function(newNames) {
      const totalPoints = newNames.reduce((total, name) => {
        const selectedData = this.csvData.find(item => item.rider_name === name);
        return total + (selectedData ? Number(selectedData.points) : 0);
      }, 0);

      console.log('Geselecteerde namen:', newNames);
      console.log('Totaalpunten:', totalPoints);
    },
  },
  computed: {
    totalPoints() {
        return this.selectedNames.reduce((total, name) => {
            const selectedData = this.csvData.find(item => item.rider_name === name);
            return total + (selectedData ? Number(selectedData.points) : 0);
        },0);
    },
    isSubmitDisabled() {
        return this.totalPoints > 6 || this.selectedNames.length !== 10;
    },
    buttonMessage() {
        if (this.totalPoints > 6) {
            return "Teveel punten geselecteerd";
        } else if (this.selectedNames.length !== 10) {
            return "Niet genoeg renners geselecteerd";
        } else {
            return "Verstuur selectie";
        }
    },
  },
  mounted() {
    this.fetchCSVData(); // Haal de CSV-gegevens op bij het laden van de pagina
  },
});
