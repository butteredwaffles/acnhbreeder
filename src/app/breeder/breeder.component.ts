import { Component, OnInit } from '@angular/core';
import { Flower, FlowerType, generateGrid} from '../flower';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-breeder',
  templateUrl: './breeder.component.html',
  styleUrls: ['./breeder.component.scss']
})
export class BreederComponent implements OnInit {
  all_possible_flowers: Object[];
  gridOptions;
  gridRows: number = 5;
  gridColumns: number = 5;
  grid;
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.gridOptions = this.formBuilder.group({
      rows: 5,
      columns: 5
    });
  }
  

  loadCSV(): void {
    let text;
    let all_flowers = [];
    let flower_keys = Object.keys(FlowerType).slice(8); // Actual enum names begin at 8
    this.http.get("assets/flowerdata.csv", {responseType: 'text'})
        .subscribe(res => {
          text = res.split('\n').slice(1);
          let start_index = 1;
          for (let data of text) {
            let info = data.split(',');
            let type = FlowerType[flower_keys.indexOf(info[0])];
            start_index += 1;
            all_flowers.push(new Flower(start_index, type, info[1], info[2], info[3], info[4], info[5].toLowerCase(), 0));
          }
          this.all_possible_flowers = all_flowers;
        });
  }

  onSubmit(gridOptionsData): void {
    this.gridRows = gridOptionsData.rows;
    this.gridColumns = gridOptionsData.columns;
    this.grid = generateGrid(this.gridRows, this.gridColumns);
  }

  ngOnInit(): void {
    this.loadCSV();
    this.grid = generateGrid(this.gridRows, this.gridColumns);
  }
}
