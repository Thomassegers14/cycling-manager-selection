import Papa from 'papaparse';
import * as d3 from 'd3';

new Vue({
  el: '#app',
  data: {
    pointsMaxValue: 10,
    ridersMaxValue: 12,
    csvData: [], // Hier worden de gegevens uit de CSV opgeslagen
    availableNames: [], // Array voor alleen de namen
    selectedNames: [],
    groupedData: [], // Array voor het gegroepeerde teamdata
    margin: { top: 12, right: 6, bottom: 0, left: 90 }
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
      if (this.selectedNames.length !== this.ridersMaxValue) {
        alert('Selecteer exact 12 namen voordat je ze verstuurt.');
        return;
      }
    },
    resetSelection() {
      this.selectedNames = [];
    },
    getPointsClass(points) {
      if (points == 4) {
        return 'riderElement riderElement--highPoints';
      } else if (points == 2) {
        return 'riderElement riderElement--mediumPoints';
      } else {
        return 'riderElement riderElement--lowPoints';
      }
    },
    drawInitialRidersBarChart() {
      const { width, height } = d3.select('.barChart--riders').node().getBoundingClientRect()

      // set inner dimensions
      const innerWidth = width - this.margin.left - this.margin.right
      const innerHeight = height - this.margin.top - this.margin.bottom

      // append the svg object to the body of the page
      const svg = d3.select('.barChart--riders')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

      const xScale = d3.scaleLinear().range([0, innerWidth]).domain([0, this.ridersMaxValue * 1.25])
      const yScale = d3.scaleBand().range([innerHeight, 0]).domain(['Selectie']).padding(0.1)

      svg
        .append('rect')
        .attr('class', 'bgRect')
        .attr('y', yScale('Selectie'))
        .attr('x', xScale(0))
        .attr('height', yScale.bandwidth())
        .attr('width', xScale(this.ridersMaxValue * 1.25))

      svg
        .append('rect')
        .attr('class', 'bar')
        .attr('y', yScale('Selectie'))
        .attr('x', xScale(this.selectedNames.length))
        .attr('height', yScale.bandwidth())
        .attr('width', xScale(this.selectedNames.length))

      svg.append('g')
        .attr('class', 'axis axis__x--minor')
        .call(
          d3.axisTop(xScale)
            .ticks(this.ridersMaxValue * 1.25)
            .tickSize(-innerHeight)
        )

      svg.append('g')
        .attr('class', 'axis axis__x')
        .call(
          d3.axisTop(xScale)
            .tickValues([0, this.ridersMaxValue])
            .tickSize(-innerHeight)
        )

      svg.append('g')
        .attr('class', 'axis axis__y')
        .call(
          d3.axisLeft(yScale)
          .tickSize(0)
          .tickPadding(24)
        )

      svg.selectAll('.axis').select('.domain').remove()
    },
    drawInitialPointsBarChart() {
      const { width, height } = d3.select('.barChart--points').node().getBoundingClientRect()

      // set inner dimensions
      const innerWidth = width - this.margin.left - this.margin.right
      const innerHeight = height - this.margin.top - this.margin.bottom

      // append the svg object to the body of the page
      const svg = d3.select('.barChart--points')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

      const totalSelectedPoints = this.selectedNames.reduce((total, name) => {
        const rider = this.csvData.find(item => item.rider_name === name);
        return total + Number(rider.points)
      }, 0)

      const xScale = d3.scaleLinear().range([0, innerWidth]).domain([0, this.pointsMaxValue * 1.25])
      const yScale = d3.scaleBand().range([innerHeight, 0]).domain(['Punten']).padding(0.1)

      svg
        .append('rect')
        .attr('class', 'bgRect')
        .attr('y', yScale('Punten'))
        .attr('x', xScale(0))
        .attr('height', yScale.bandwidth())
        .attr('width', xScale(this.pointsMaxValue * 1.25))

      svg
        .append('rect')
        .attr('class', 'bar')
        .attr('y', yScale('Punten'))
        .attr('x', xScale(totalSelectedPoints))
        .attr('height', yScale.bandwidth())
        .attr('width', xScale(totalSelectedPoints))

        svg.append('g')
        .attr('class', 'axis axis__x--minor')
        .call(
          d3.axisTop(xScale)
            .ticks(this.pointsMaxValue * 1.25 / 2)
            .tickSize(-innerHeight)
        )

        svg.append('g')
        .attr('class', 'axis axis__x')
        .call(
          d3.axisTop(xScale)
            .tickValues([0, this.pointsMaxValue])
            .tickSize(-innerHeight)
        )

      svg.append('g')
        .attr('class', 'axis axis__y')
        .call(
          d3.axisLeft(yScale)
          .tickSize(0)
          .tickPadding(24)
        )

      svg.selectAll('.axis').select('.domain').remove()
    },
    drawPointsBarChart() {
      const totalSelectedPoints = this.selectedNames.reduce((total, name) => {
        const rider = this.csvData.find(item => item.rider_name === name);
        return total + Number(rider.points);
      }, 0);

      const { width, height } = d3.select('.barChart--points').node().getBoundingClientRect()

      // set inner dimensions
      const innerWidth = width - this.margin.left - this.margin.right

      // append the svg object to the body of the page
      const svg = d3.select('.barChart--points')

      const xScale = d3.scaleLinear().range([0, innerWidth]).domain([0, this.pointsMaxValue * 1.25])

      svg.select('.bar').attr('width', xScale(totalSelectedPoints));
    },
    drawRidersBarChart() {
      const { width } = d3.select('.barChart--riders').node().getBoundingClientRect()

      // set inner dimensions
      const innerWidth = width - this.margin.left - this.margin.right

      // append the svg object to the body of the page
      const svg = d3.select('.barChart--riders')

      const xScale = d3.scaleLinear().range([0, innerWidth]).domain([0, this.ridersMaxValue * 1.25])

      svg.select('.bar').attr('width', xScale(this.selectedNames.length));
    },
  },
  watch: {
    selectedNames: function (newNames) {
      const totalPoints = newNames.reduce((total, name) => {
        const selectedData = this.csvData.find(item => item.rider_name === name);
        return total + (selectedData ? Number(selectedData.points) : 0);
      }, 0);

      console.log('Geselecteerde namen:', newNames);
      console.log('Totaalpunten:', totalPoints);

      this.drawPointsBarChart()
      this.drawRidersBarChart()
    },
  },
  computed: {
    totalPoints() {
      return this.selectedNames.reduce((total, name) => {
        const selectedData = this.csvData.find(item => item.rider_name === name);
        return total + (selectedData ? Number(selectedData.points) : 0);
      }, 0)
    },
    isSubmitDisabled() {
      return this.totalPoints > this.pointsMaxValue || this.selectedNames.length !== this.ridersMaxValue;
    },
    buttonMessage() {
      if (this.totalPoints > 6) {
        return "Teveel punten geselecteerd";
      } else if (this.selectedNames.length !== this.ridersMaxValue) {
        return "Niet genoeg renners geselecteerd";
      } else {
        return "Verstuur selectie";
      }
    },
  },
  mounted() {
    this.fetchCSVData()
    this.drawInitialPointsBarChart()
    this.drawInitialRidersBarChart()
  },
});
