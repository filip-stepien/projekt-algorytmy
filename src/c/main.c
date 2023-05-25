#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include <stdbool.h>

void print_performance(int* num_operations, clock_t* start) {
    clock_t end = clock();
    double cpu_time_used = ((double) (end - (*start))) / CLOCKS_PER_SEC;
    double ops_per_sec = ((double) (*num_operations)) / cpu_time_used;
    printf("%.0f wyznacznikow/s\n", ops_per_sec);
    *num_operations = 0;
    *start = clock();
}

int** get_matrix(int size) {
    int **arr = (int**)malloc(size * sizeof(int*));
    for(int i = 0; i < size; i++) {
        arr[i] = (int*)malloc(size * sizeof(int));
    }
    return arr;
}

int** copy_matrix(int** matrix, int size) {
    int** new_matrix = get_matrix(size);
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            new_matrix[i][j] = matrix[i][j];
        }
    }
    return new_matrix;
}

void free_matrix(int **matrix, int size) {
    for (int i = 0; i < size; i++) {
        free(matrix[i]);
    }
    free(matrix);
}

void print_matrix(int** matrix, int size) {
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("\n");
    }
    printf("\n");
}

void init_matrix(int** matrix, int size, int min) {
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            matrix[i][j] = min;
        }
    }
}

void get_submatrix(int** matrix, int** submatrix, int matrix_size, int x, int y) {
    int idx_n = 0, idx_m = 0;
    for(int n = 0; n < matrix_size; n++) {
        if(n != y) {
            for(int m = 0; m < matrix_size; m++) {
                if(m != x) {
                    submatrix[idx_n][idx_m] = matrix[n][m];
                    idx_m++;
                }
            }
            idx_n++;
        }
        idx_m = 0;
    }
}

void save_matrix(int** matrix, int size, FILE *file) {
    for(int i=0; i<size; i++) {
        for(int j=0; j<size; j++) {
            fprintf(file, "%d ", matrix[i][j]);
        }
        fprintf(file, "\n");
    }
    fprintf(file, "\n");
}

void save_histogram(int det, FILE *file) {
    fprintf(file, "%d ", det);
}

int laplace(int** matrix, int size) {
    int det = 0;

    if (size == 1) {
        det = matrix[0][0];
    } else if (size == 2) {
        det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    } else {
        int** submatrix = get_matrix(size-1);
        for(int i = 0; i < size; i++) {
            get_submatrix(matrix, submatrix, size, i, 0);
            int submatrix_det = laplace(submatrix, size-1);

            det += (((i & 1) == 0) ? 1 : -1) * matrix[0][i] * submatrix_det;
        }
        free_matrix(submatrix, size-1);
    }

    return det;
}

int bareiss(int **matrix, int size) {
    int** new_matrix = copy_matrix(matrix, size);
    int sign = 1;

    if(size <= 0) {
        return 0;
    }

    for(int k = 0; k < size - 1; k++) {
        if(new_matrix[k][k] == 0) {
            int m = 0;
            for(m = k + 1; m < size; m++) {
                if(new_matrix[m][k] != 0) {
                    int *temp = new_matrix[k];
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

        for (int i = k + 1; i < size; i++) {
            for (int j = k + 1; j < size; j++) {
                new_matrix[i][j] = new_matrix[k][k] * new_matrix[i][j] - new_matrix[i][k] * new_matrix[k][j];
                if(k != 0) {
                    new_matrix[i][j] /= new_matrix[k-1][k-1];
                }
            }
        }
    }

    int result = sign * new_matrix[size-1][size-1];
    free_matrix(new_matrix, size);

    return result;
}


void calculate_all_dets(int** matrix, int size, int min, int max, int det, int func, FILE* matricies, FILE* histogram, int* num_operations, clock_t* start, int i, int j) {
    if(i == size) {
        int current_det = (func == 1) ? bareiss(matrix, size) : laplace(matrix, size);

        if(matricies != NULL && current_det == det)
        save_matrix(matrix, size, matricies);

        if(histogram != NULL)
        save_histogram(current_det, histogram);

        if((*num_operations) > 1e6) print_performance(num_operations, start);
        (*num_operations)++;

        return;
    }

    for(int k = min; k <= max; k++) {
        matrix[i][j] = k;
        if(j < size-1) calculate_all_dets(matrix, size, min, max, det, func, matricies, histogram, num_operations, start, i, j+1);
        else calculate_all_dets(matrix, size, min, max, det, func, matricies, histogram, num_operations, start, i+1, 0);
    }
}

void get_user_input(int* size, int* min, int* max, int* det, int* func) {
    printf("Podaj wielkosc macierzy N x N:\nN = ");
    scanf("%d", size);

    printf("\nWprowadz zakres elementow macierzy: \nPrzykladowy format: -1,2\nZakres: ");
    scanf("%d,%d", min, max);

    printf("\nPodaj wartosc szukanego wyznacznika: ");
    scanf("%d", det);

    printf("\nWybierz sposob obliczania wyznacznikow: ");
    printf("\n1. Algorytm Bareiss'a");
    printf("\n2. Rozwiniecie Laplace'a\n");
    scanf("%d", func);

    if(*func != 1 && *func != 2) {
        printf("\nPrzyjeto opcje domyslna (1).\n");
        *func = 1;
    }

    printf("\nRozpoczynanie...\n\n");
}

int main(int argc, char **argv) {
    int size, min, max, det, func, num_operations = 0;
    clock_t start;
    FILE *matricies = NULL;
    FILE *histogram = NULL;

    switch (argc) {
        case 1:
            printf("Zapis macierzy: BRAK SCIEZKI\n");
            printf("Zapis tymczasowego histogramu: BRAK SCIEZKI\n\n");
            break;
        case 2:
            matricies = fopen(argv[1], "w");
            printf("Zapis macierzy: %s\n", argv[1]);
            printf("Zapis tymczasowego histogramu: BRAK SCIEZKI\n\n");
            break;
        default:
            matricies = fopen(argv[1], "w");
            histogram = fopen(argv[2], "w");
            printf("Zapis macierzy: %s\n", argv[1]);
            printf("Zapis tymczasowego histogramu: %s\n\n", argv[2]);
    }

    get_user_input(&size, &min, &max, &det, &func);

    int** matrix = get_matrix(size);
    init_matrix(matrix, size, min);

    start = clock();
    calculate_all_dets(matrix, size, min, max, det, func, matricies, histogram, &num_operations, &start, 0, 0);

    fclose(matricies);
    fclose(histogram);
    free_matrix(matrix, size);

    /*int** matrix = get_matrix(3);

    matrix[0][0] = 0;
    matrix[0][1] = 1;
    matrix[0][2] = 0;

    matrix[1][0] = 3;
    matrix[1][1] = 0;
    matrix[1][2] = 2;

    matrix[2][0] = 2;
    matrix[2][1] = 0;
    matrix[2][2] = 1;

    printf("%d", bareiss(matrix, 3));*/

    return 0;
}
