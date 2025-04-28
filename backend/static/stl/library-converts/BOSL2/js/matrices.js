// LibFile: matrices.js
// This file provides matrix operations for linear algebra, with support for matrix construction,
// solutions to linear systems of equations, and matrix transformations.

import { is_list, is_undef, is_num, is_finite, is_vector, is_bool, assert } from '../../../compat/index.js';
import { EPSILON } from './math.js';

// Function: is_matrix()
// Description:
//   Returns true if A is a numeric matrix of height m and width n with finite entries.  If m or n
//   are omitted or set to undef then true is returned for any positive dimension.
// Arguments:
//   A = The matrix to test.
//   m = If given, requires the matrix to have this height.
//   n = Is given, requires the matrix to have this width.
//   square = If true, matrix must have height equal to width. Default: false
export function is_matrix(A, m, n, square=false) {
    return is_list(A)
        && ((is_undef(m) && A.length) || A.length === m)
        && (!square || A.length === A[0].length)
        && is_vector(A[0], n)
        && A.every(row => row.length === A[0].length)
        && A.every(row => row.every(x => is_finite(x)));
}

// Function: is_matrix_symmetric()
// Description: Returns true if the given matrix is square and symmetric
export function is_matrix_symmetric(A) {
    if (!is_matrix(A, undefined, undefined, true)) return false;
    const n = A.length;
    for (let i = 0; i < n; i++) {
        for (let j = i+1; j < n; j++) {
            if (Math.abs(A[i][j] - A[j][i]) > EPSILON) return false;
        }
    }
    return true;
}

// Function: ident()
// Description: Creates an n by n identity matrix
export function ident(n) {
    assert(is_num(n) && n >= 0, "Input must be a non-negative number");
    const result = [];
    for (let i = 0; i < n; i++) {
        const row = Array(n).fill(0);
        row[i] = 1;
        result.push(row);
    }
    return result;
}

// Function: matrix_transpose()
// Description: Returns the transpose of the given matrix
export function matrix_transpose(M) {
    assert(is_matrix(M), "Input must be a matrix");
    const rows = M.length;
    const cols = M[0].length;
    const result = Array(cols).fill().map(() => Array(rows));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = M[i][j];
        }
    }
    return result;
}

// Function: submatrix()
// Description: Extracts a submatrix from the given matrix
export function submatrix(M, rs, cs) {
    assert(is_matrix(M), "Input must be a matrix");
    const rows = rs.map(i => M[i]);
    return rows.map(row => cs.map(j => row[j]));
}

// Function: column()
// Description: Extracts the specified column from a matrix
export function column(M, i) {
    assert(is_matrix(M), "Input must be a matrix");
    assert(i >= 0 && i < M[0].length, "Column index out of bounds");
    return M.map(row => row[i]);
}

// Function: matrix_mul()
// Description: Multiplies two matrices
export function matrix_mul(A, B) {
    assert(is_matrix(A) && is_matrix(B), "Inputs must be matrices");
    assert(A[0].length === B.length, "Matrix dimensions must match for multiplication");
    
    const result = [];
    for (let i = 0; i < A.length; i++) {
        const row = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < B.length; k++) {
                sum += A[i][k] * B[k][j];
            }
            row.push(sum);
        }
        result.push(row);
    }
    return result;
}

// Function: determinant()
// Description: Computes the determinant of a square matrix
export function determinant(M) {
    assert(is_matrix(M, undefined, undefined, true), "Input must be a square matrix");
    
    const n = M.length;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    
    let det = 0;
    for (let j = 0; j < n; j++) {
        const minor = [];
        for (let i = 1; i < n; i++) {
            const row = [];
            for (let k = 0; k < n; k++) {
                if (k !== j) row.push(M[i][k]);
            }
            minor.push(row);
        }
        det += Math.pow(-1, j) * M[0][j] * determinant(minor);
    }
    return det;
}

// Function: matrix_inverse()
// Description: Computes the inverse of a square matrix
export function matrix_inverse(M) {
    assert(is_matrix(M, undefined, undefined, true), "Input must be a square matrix");
    
    const n = M.length;
    const det = determinant(M);
    assert(Math.abs(det) > EPSILON, "Matrix is not invertible");
    
    if (n === 1) return [[1/M[0][0]]];
    
    const adj = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            const minor = [];
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const minorRow = [];
                    for (let l = 0; l < n; l++) {
                        if (l !== j) minorRow.push(M[k][l]);
                    }
                    minor.push(minorRow);
                }
            }
            const cofactor = Math.pow(-1, i + j) * determinant(minor);
            row.push(cofactor);
        }
        adj.push(row);
    }
    
    const adjT = matrix_transpose(adj);
    return adjT.map(row => row.map(val => val / det));
}

// Function: matrix_copy()
// Description: Creates a copy of the given matrix
export function matrix_copy(M) {
    return M.map(row => [...row]);
}

// Function: back_substitute()
// Description: Performs back substitution on an upper triangular matrix
export function back_substitute(U, b) {
    assert(is_matrix(U, undefined, undefined, true), "First input must be a square matrix");
    assert(is_vector(b) && b.length === U.length, "Second input must be a vector with length matching matrix dimensions");
    
    const n = U.length;
    const x = Array(n).fill(0);
    
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += U[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / U[i][i];
    }
    
    return x;
}

// Function: is_rotation()
// Description: Checks if a 3×3 matrix is a rotation matrix
export function is_rotation(M, error=EPSILON) {
    if (!is_matrix(M, 3, 3)) return false;
    
    // Check orthogonality: M * M^T = I
    const MT = matrix_transpose(M);
    const prod = matrix_mul(M, MT);
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const expected = i === j ? 1 : 0;
            if (Math.abs(prod[i][j] - expected) > error) return false;
        }
    }
    
    // Check determinant = 1
    const det = determinant(M);
    return Math.abs(det - 1) <= error;
}
