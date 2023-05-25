const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
const { performance } = require('perf_hooks');
const fs = require('fs');

let size, min, max, det, end, start, func, numOperations = 0;
let matrix = [];

function printPerformance() {
    end = performance.now();
    let cpuTimeUsed = end - start;
    let opsPerSec = numOperations / (cpuTimeUsed / 1000);
    console.log(`${parseInt(opsPerSec)} wyznacznikow/s`);
    numOperations = 0;
    start = performance.now();
}

function getMatrix(size) {
    let matrix = [];
    for(let i=0; i<size; i++) {
        matrix.push([]);
        for(let j=0; j<size; j++) {
            matrix[i][j] = 0;
        }
    }
    return matrix;
}

function initMatrix(matrix, size) {
    for(let i=0; i<size; i++) {
        matrix.push([]);
        for(let j=0; j<size; j++) {
            matrix[i][j] = min;
        }
    }
}

function saveMatrix(matrix) {
    if(process.argv.length < 3) return;
    for(let i=0; i<size; i++) {
        for(let j=0; j<size; j++) {
            fs.appendFileSync(process.argv[2], `${matrix[i][j]} `);
        }
        fs.appendFileSync(process.argv[2], '\n');
    }
    fs.appendFileSync(process.argv[2], '\n');
}

function saveHistogram(det) {
    if(process.argv.length < 4) return;
    fs.appendFileSync(process.argv[3], `${det} `);
}

function copyMatrix(matrix) {
    return structuredClone(matrix);
}

function bareiss(matrix, size) {
    let new_matrix = copyMatrix(matrix);
    let sign = 1;

    if(size <= 0) {
        return 0;
    }

    for(let k=0; k<size-1; k++) {
        if(new_matrix[k][k] == 0) {
            let m = 0;
            for(m=k+1; m<size; m++) {
                if(new_matrix[m][k] != 0) {
                    let temp = new_matrix[k];
                    new_matrix[k] = new_matrix[m];
                    new_matrix[m] = temp;
                    sign = -sign;
                    break;
                }
            }

            if(m == size) {
                return 0;
            }
        }

        for (let i=k+1; i<size; i++) {
            for (let j=k+1; j<size; j++) {
                new_matrix[i][j] = new_matrix[k][k] * new_matrix[i][j] - new_matrix[i][k] * new_matrix[k][j];
                if(k != 0) {
                    new_matrix[i][j] /= new_matrix[k-1][k-1];
                }
            }
        }
    }

    return sign * new_matrix[size-1][size-1];
}

function getSubmatrix(matrix, submatrix, size, x, y) {
    let idxN = 0, idxM = 0;
    for(let n = 0; n < size; n++) {
        if(n != y) {
            for(let m = 0; m < size; m++) {
                if(m != x) {
                    submatrix[idxN][idxM] = matrix[n][m];
                    idxM++;
                }
            }
            idxN++;
        }
        idxM = 0;
    }
}

function laplace(matrix, size) {
    let det = 0;
    if(size == 1) {
        det = matrix[0][0];
    } else if(size == 2) {
        det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    } else {
        let submatrix = getMatrix(size-1);
        for(let i=0; i<size; i++) {
            getSubmatrix(matrix, submatrix, size, i, 0);
            let submatrixDet = laplace(submatrix, size-1);
            det += (((i&1) == 0) ? 1 : -1) * matrix[0][i] * submatrixDet;
        }
    }
    return det;
}

function calculateAllDets(matrix, i, j) {
    if(i == size) {
        let currentDet = func == 1 ? bareiss(matrix, size) : laplace(matrix, size);
            
        if(currentDet == det) 
        saveMatrix(matrix);

        saveHistogram(currentDet);

        if(numOperations > 1e3) printPerformance();
        numOperations++;

        return;
    }

    for(let k=min; k<=max; k++) {
        matrix[i][j] = k;
        if(j < size-1) calculateAllDets(matrix, i, j+1);
        else calculateAllDets(matrix, i+1, 0);
    }
}

function getUserInput() {
    switch (process.argv.length) {
        case 2:
            console.log('Zapis macierzy: BRAK SCIEZKI');
            console.log('Zapis tymczasowego histogramu: BRAK SCIEZKI');
            break;
        case 3:
            console.log(`Zapis macierzy: ${process.argv[2]}`);
            console.log(`Zapis tymczasowego histogramu: BRAK SCIEZKI`);
            fs.writeFileSync(process.argv[2], '');
            break;
        default:
            console.log(`Zapis macierzy: ${process.argv[2]}`);
            console.log(`Zapis tymczasowego histogramu: ${process.argv[3]}`);
            fs.writeFileSync(process.argv[2], '');
            fs.writeFileSync(process.argv[3], '');
    }

    readline.question('\nPodaj wielkosc macierzy N x N:\nN = ', answer => {
        size = answer;
        readline.question('\nWprowadz zakres elementow macierzy: \nPrzykladowy format: -1,2\nZakres: ', answer => {
            const [low, high] = answer.split(',');
            min = low;
            max = high;
            readline.question('\nPodaj wartosc szukanego wyznacznika: ', answer => {
                det = answer;
                readline.question('\nWybierz sposob obliczenia wyznacznikow:\n1. Algorytm Bareiss\'a\n2. Rozwiniecie Laplace\'a\n', answer => {
                    func = answer;

                    if(func != 1 && func != 2) {
                        console.log('\nPrzyjeto opcje domyslna (1).');
                        func = 1;
                    }

                    console.log('\nRozpoczynanie...\n');

                    readline.close();
                    main();
                });
            });
        });
    });
}

function main() {
    initMatrix(matrix, size);
    start = performance.now();
    calculateAllDets(matrix, 0, 0);
}

getUserInput();