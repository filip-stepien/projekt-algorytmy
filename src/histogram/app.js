const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const path = require('path');
const chalk = require('chalk');

if(!process.argv[2]) {
    console.log(chalk.red.bold('Nie znaleziono pliku z histogramem. Upewnij sie, ze sciezka jest poprawna i plik z histogramem zostal wygenerowany.'));
    process.exit(1);
}

let start = Date.now();
let data = '';
try {
    console.log(chalk.cyanBright('Odczytywanie danych...'));
    data = fs.readFileSync(process.argv[2], { encoding: 'ascii' });
}
catch (e) {
    console.log(chalk.red('Blad przy otwieraniu pliku z histogramem. Upewnij sie, ze zostal wygenerowany.'));
    process.exit(1);
} 

let arr = data.split(' ').map(e => parseInt(e));
arr.pop();

console.log(chalk.cyanBright('Tworzenie histogramu...'));
let dataObj = {};
arr.forEach(e => dataObj.hasOwnProperty(e) ? dataObj[e]++ : dataObj[e] = 1);

const entries = Object.entries(dataObj);
const sortedEntries = [...entries].sort((a, b) => a[0] - b[0]);
const keys = sortedEntries.map(e => e[0]);
const values = sortedEntries.map(e => e[1]);

const json = JSON.stringify(dataObj, null, '\t');

if(process.argv[3]) {
    console.log(chalk.yellow(`Zapisywanie histogramu w ${path.resolve(process.argv[3])}`));
    fs.writeFileSync(process.argv[3], json);
} else {
    console.log(chalk.yellow(`Nie podano sciezki! Zapisywanie histogramu w ${path.resolve('./histogram.json')}`));
    fs.writeFileSync('./histogram.json', json);
}

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1920, height: 1080, backgroundColour: 'white', chartCallback: ChartJS => {
    ChartJS.defaults.backgroundColor = '#9BD0F5';
}});

const labels = [...keys];
const dataChart = {
labels: labels,
datasets: [{
        label: 'Ilość wyznaczników',
        data: [...values]
    }]
};
const config = {
    type: 'bar',
    data: dataChart
};

if(process.argv[4]) {
    console.log(chalk.yellow(`Zapisywanie wykresu w ${path.resolve(process.argv[4])}`));
    chartJSNodeCanvas.renderToBuffer(config, 'image/png').then(buffer => {
        fs.writeFileSync(process.argv[4], buffer, 'base64');
        console.log(chalk.greenBright(`Ukończono! Czas: ${(Date.now() - start)/1000} s\n`));
    });
} else {
    console.log(chalk.yellow(`Nie podano ścieżki! Zapisywanie wykresu w ${path.resolve('./histogram.png')}`));
    chartJSNodeCanvas.renderToBuffer(config, 'image/png').then(buffer => {
        fs.writeFileSync('./histogram.png', buffer, 'base64');
        console.log(chalk.greenBright(`Ukończono! Czas: ${(Date.now() - start)/1000} s\n`));
    });
}