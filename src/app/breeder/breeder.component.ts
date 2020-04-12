import { Component, OnInit } from '@angular/core';
import * as flower from '../flower';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { range } from 'rxjs';

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
            all_flowers.push(new flower.Flower(type, parseInt(info[1]), parseInt(info[2]), parseInt(info[3]), parseInt(info[4]), info[5].toLowerCase(), 0, info[6] == 1 ? true : false));
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
  
}
