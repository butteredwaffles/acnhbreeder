import { HttpClient } from '@angular/common/http';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
import { ɵɵstylePropInterpolate2 } from '@angular/core';
// Generation is 0 if the plant is from a seed bag. If the plant is not a rose, rose_gene is 0.

interface IFlowerParams {

}

export class Flower {
    opt_id: number = -1;
    type: FlowerType;
    genes: {};
    color: string;
    generation: number;
    isSeedBag: boolean;
    isHybridIsle: boolean;
    image_loc: string;
    has_bred: boolean = false;
    parents: Flower[] = [];
    x: number = -1;
    y: number = -1;


    constructor(options: {attrs?: {}, parents?: Flower[], id?: number; type?: FlowerType, red_gene?: number, yellow_gene?: number, white_gene?: number, rose_gene?: number, color?: string, generation?: number, isSeedBag?: boolean, isHybrid?: boolean}) {
        if (options.attrs !== undefined) {
            let attrs = options.attrs;
            this.type = FlowerType[attrs['data-type'].value[0].toUpperCase() + attrs['data-type'].value.slice(1)];
            let strgenes: string[] = attrs['data-genes'].value.split('');
            let split: number[] = Array.from(strgenes, x => parseInt(x));
            this.genes = {
                red: split[0],
                yellow: split[1],
                white: split[2],
                rose: split[3]
            }
            this.color = attrs['data-color'].value;
            this.generation = attrs['data-generation'].value;
            this.isSeedBag = attrs['data-isSeedBag'].value;
            this.isHybridIsle = attrs['data-isHybridFlower'].value;
            this.image_loc = "assets/images/" + this.color + "_" + this.type + ".png";
            options.id === undefined ? null : this.opt_id = options.id;
            options.parents === undefined ? null : this.parents = options.parents;
        }
        else {
            this.type = options.type;
            this.genes = {
                red: options.red_gene,
                yellow: options.yellow_gene,
                white: options.white_gene,
                rose: options.rose_gene
            };
            this.color = options.color;
            this.generation = options.generation;
            options.isSeedBag === undefined ? null : this.isSeedBag = options.isSeedBag;
            options.isHybrid === undefined ? null : this.isHybridIsle = options.isHybrid;
            this.image_loc = "assets/images/" + options.color + "_" + this.type + ".png";
            options.id === undefined ? null : this.opt_id = options.id;
            options.parents === undefined ? null : this.parents = options.parents;
        }
    }

    equals(genes, other) {
        return genes.red === other.red && genes.yellow === other.yellow && genes.white == other.white && genes.rose === other.rose;
    }

    breed(other: Flower, all_flowers: Flower[], parent_gen: number): Flower {
        let new_genes = {};
        let new_color;
        for (var key in other.genes) {
            let par1, par2;
            switch (this.genes[key]) {
                case 2:
                    par1 = 1;
                    break;
                case 1:
                    par1 = Math.floor(Math.random() * 2);
                    break;
                case 0:
                    par1 = 0;
                    break;
            }

            switch (other.genes[key]) {
                case 2:
                    par2 = 1;
                    break;
                case 1:
                    par2 = Math.floor(Math.random() * 2);
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
        return new Flower({type: this.type, red_gene: new_genes["red"], yellow_gene: new_genes["yellow"], white_gene: new_genes["white"], rose_gene: new_genes["rose"], color: new_color, generation: parent_gen + 1, isSeedBag: false});
    }

    generatePossibleChildrenImages(other: Flower, all_flowers: Flower[]) {
        let filtered = all_flowers.filter(fl => fl.type === this.type);
        let results = Array.from({length: 30}, x => this.breed(other, filtered, -1).image_loc).sort();
        return results.filter((val, index) => results.indexOf(val) === index);
    }

    static fromJson(json: string) {
        let ob = JSON.parse(json);
        return new Flower({parents: ob.parents, id: ob.opt_id, type: FlowerType[ob.type[0].toUpperCase() + ob.type.slice(1)], red_gene: ob.genes.red, yellow_gene: ob.genes.yellow, white_gene: ob.genes.white, rose_gene: ob.genes.rose, color: ob.color, generation: ob.generation, isSeedBag: ob.isSeedBag, isHybrid: ob.isHybridIsle});
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

export let blankFlower = new Flower({type: FlowerType.Blank, red_gene: 0, yellow_gene: 0, white_gene: 0, rose_gene: 0, color: "none", generation: 0, isSeedBag: false});
export function generateGrid(rows: number, columns: number) {
    let grid = [];
    for (let i = 0; i < rows; i++) {
        grid.push([])
        for (let j = 0; j < columns; j++) {
            grid[i].push(blankFlower);
            grid[i][j].x = i;
            grid[i][j].y = j;
        }
    }
    return grid;
}

export function findNeighbors(grid: Flower[][], x, y) {
    let foundNeighbors = [];
    for (let i = Math.max(0, x-1); i <= Math.min(x+1, grid.length); i++) {
        for (let j = Math.max(0, y-1); j <= Math.min(y+1, grid[0].length); j++) {
            if (i != x || j != y) {
                foundNeighbors.push([i, j]);
            }
        }
    }
    return foundNeighbors;
}