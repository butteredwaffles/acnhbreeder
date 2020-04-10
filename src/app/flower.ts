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
    isSeedBag: boolean;
    image_loc: string;

    constructor(id, type, red_gene, yellow_gene, white_gene, rose_gene, color, generation, isSeedBag) {
        this.id = id;
        this.type = type;
        this.red_gene = red_gene;
        this.yellow_gene = yellow_gene;
        this.white_gene = white_gene;
        this.rose_gene = rose_gene;
        this.color = color;
        this.generation = generation;
        this.isSeedBag = isSeedBag;
        this.image_loc = "assets/images/" + color + "_" + this.type + ".png";
    }
}

export enum FlowerType {
    Rose = "rose",
    Tulip = "tulip",
    Pansy = "pansy",
    Cosmos = "cosmos",
    Lily = "lily",
    Hyacinth = "hyacinth",
    Windflower = "windflower",
    Mum = "mum",
    Blank = "blank"
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

export function findNeighbors(grid, x, y) {
    for (let i = Math.max(0, x-1); i <= Math.min(x+1, grid.length); i++) {
        for (let j = Math.max(0, y-1); j <= Math.min(y+1, grid[0].length); j++) {
            if (i != x || j != y) {
                console.log(i, j);
            }
        }
    }
}