import { HttpClient } from '@angular/common/http';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
// Generation is 0 if the plant is from a seed bag. If the plant is not a rose, rose_gene is 0.
export class Flower {
    id: number;
    type: FlowerType;
    red_gene: number;
    yellow_gene: number;
    white_gene: number;
    rose_gene: number;
    color: string;
    generation: number;

    constructor(id, type, red_gene, yellow_gene, white_gene, rose_gene, color, generation) {
        this.id = id;
        this.type = type;
        this.red_gene = red_gene;
        this.yellow_gene = yellow_gene;
        this.white_gene = white_gene;
        this.rose_gene = rose_gene;
        this.color = color;
        this.generation = generation;
    }
}

export enum FlowerType {
    Rose,
    Tulip,
    Pansy,
    Cosmos,
    Lily,
    Hyacinth,
    Windflower,
    Mum,
    Blank
}


export function generateGrid(rows: number, columns: number) {
    let grid = [];
    for (let i = 0; i < rows; i++) {
        grid.push([])
        for (let j = 0; j < columns; j++) {
            grid[i].push({'type': FlowerType.Mum});
        }
    }
    return grid;
}