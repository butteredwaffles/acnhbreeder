import { Component, OnInit } from '@angular/core';
import * as flower from '../flower';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { range } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-breeder',
  templateUrl: './breeder.component.html',
  styleUrls: ['./breeder.component.scss']
})

export class BreederComponent implements OnInit {
  all_possible_flowers: flower.Flower[] = [];
  seed_flowers: flower.Flower[] = [];
  seed_spliced: flower.Flower[][] = [];
  gridOptions;
  gridRows: number = 5;
  gridColumns: number = 5;
  grid;
  submitted;

  //empty constructor, moved to OnInit
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}
  

  loadCSV(): void {
    let text;
    let all_flowers = [];
    
    this.http.get("assets/flowerdata.csv", {responseType: 'text'})
        .subscribe(res => {
          text = res.split('\n').slice(1);
          for (let data of text) {
            let info = data.split(',');
            let type = flower.FlowerType[info[0]];
            all_flowers.push(new flower.Flower({type: type, red_gene: parseInt(info[1]), yellow_gene: parseInt(info[2]), white_gene: parseInt(info[3]), rose_gene: parseInt(info[4]), color: info[5].toLowerCase(), generation: 0, isSeedBag: info[6] == 1 ? true : false}));
          }
          this.all_possible_flowers = all_flowers;
          this.loadSeedBags();
        });
  }

  loadSeedBags(): void {
    let seed_flws = [];
    for (let flower of this.all_possible_flowers) {
      if (flower.isSeedBag) {
        seed_flws.push(flower);
      }
    }
    this.seed_flowers = seed_flws;

    let index = 0;
    let size = 6;
    while (index < seed_flws.length) {
      this.seed_spliced.push(seed_flws.slice(index, index + size));
      index += size;
    }
    console.log(this.seed_spliced);
  }

  onSubmit(gridOptionsData): void {

    //so the user wont get "error uwu uwu uwu" as soon as they type a fuckle
    this.submitted = true;

    // stop here if form is invalid
    if (this.gridOptions.invalid) {
        return;
    }

    this.gridRows = gridOptionsData.rows;
    this.gridColumns = gridOptionsData.columns;
    
    this.grid = flower.generateGrid(this.gridRows, this.gridColumns);
  }

  //so it doesnt gets hecced on refresh
  onReset() {
    this.submitted = false;
    this.gridOptions.reset();
}

  ngOnInit(): void {
    this.loadCSV();
    this.grid = flower.generateGrid(this.gridRows, this.gridColumns);

    // loads validation and default values, makes validators required
    this.gridOptions = this.formBuilder.group({
      rows: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      columns: [5, [Validators.required, Validators.min(3), Validators.max(10)]]
    });
    //flower.findNeighbors(this.grid, 0, 0);
  }

  //get Form for validation bullhecc in html, ppl usually use just "f" tho
  get flowerValidation () { return this.gridOptions.controls; }

  onFlowerDragged(event: any) {
    event.dataTransfer.setData("flower-id", event.target.parentElement.id);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  onFlowerDropped(event: any) {
    event.preventDefault();
    let newFlower = document.getElementById(event.dataTransfer.getData("flower-id"));
    let id = event.target.id;
    let id_ele = event.target;
    // ensures that no matter where the user drags the flower wil be replaced
    while (id == "") {
      id_ele = id_ele.parentElement;
      id = id_ele.id;
    }
    let indexes = id.slice(5).split('-');
    let x: number = parseInt(indexes[0]);
    let y: number = parseInt(indexes[1]);
    this.grid[x][y] = new flower.Flower({attrs: newFlower.attributes});
  }

  highlightNeighbors() {
    for (let x = 0; x < this.gridRows; x++) {
      for (let y = 0; y < this.gridColumns; y++) {
        if (this.grid[x][y].type !== flower.FlowerType.Blank) {
          let neighbors = flower.findNeighbors(this.grid, x, y);
          let neighborColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
          for (let n of neighbors) {
            if (n[0] < this.gridRows && n[1] < this.gridColumns) {
              document.getElementById('area-' + n[0].toString() + '-' + n[1].toString()).style.backgroundColor = neighborColor;
            }
          }
        }
      }
    }
  }
  
}
