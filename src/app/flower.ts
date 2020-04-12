import { HttpClient } from '@angular/common/http';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
import { ɵɵstylePropInterpolate2 } from '@angular/core';
// Generation is 0 if the plant is from a seed bag. If the plant is not a rose, rose_gene is 0.
export class Flower {
    type: FlowerType;
    genes: {};
    color: string;
    generation: number;
    isSeedBag: boolean;
    image_loc: string;

    constructor(type, red_gene, yellow_gene, white_gene, rose_gene, color, generation, isSeedBag) {
        this.type = type;
        this.genes = {
            "red": red_gene,
            "yellow": yellow_gene,
            "white": white_gene,
            "rose": rose_gene
        };
        this.color = color;
        this.generation = generation;
        this.isSeedBag = isSeedBag;
        this.image_loc = "assets/images/" + color + "_" + this.type + ".png";
    }

    equals(genes, other) {
        return genes["red"] === other["red"] && genes["yellow"] === other["yellow"] && genes["white"] == other["white"] && genes["rose"] === genes["rose"];
    }

    breed(other: Flower, all_flowers: Flower[], parent_gen: number): Flower {
        let new_genes = {};
        let new_color;
        for (var key in other.genes) {
            let par1, par2;
            switch (this.genes[key]) {
                // Double recessive
                case 2:
                    par1 = 1;
                    break;
                // One dominant one recessive
                case 1:
                    par1 = Math.floor(Math.random() * Math.floor(2));
                    break;
                // Double dominant
                case 0:
                    par1 = 0;
                    break;
            }

            switch (other.genes[key]) {
                case 2:
                    par2 = 1;
                    break;
                case 1:
                    par2 = Math.floor(Math.random() * Math.floor(2));
                    break;
                case 0:
                    par2 = 0;
                    break;
            }
            new_genes[key] = par1+par2;
        }
        for (let fl of all_flowers) {
            if (this.equals(new_genes, fl.genes)) {
                new_color = fl.color;
                break;
            }
        }
        return new Flower(this.type, new_genes["red"], new_genes["yellow"], new_genes["white"], new_genes["rose"], new_color, parent_gen + 1, false);
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