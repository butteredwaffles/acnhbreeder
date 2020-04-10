import { Component, OnInit } from '@angular/core';
import { Flower, FlowerType} from '../flower';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-breeder',
  templateUrl: './breeder.component.html',
  styleUrls: ['./breeder.component.scss']
})
export class BreederComponent implements OnInit {
  all_flowers: Object[];
  flower: Flower = {
    id: 1,
    type: FlowerType.Rose,
    red_gene: 0,
    yellow_gene: 0,
    white_gene: 0,
    rose_gene: 0,
    color: 'white',
    generation: 0
  };
  constructor(private http: HttpClient) { }

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
            all_flowers.push(new Flower(start_index, type, info[1], info[2], info[3], info[4], info[5], 0));
          }
          this.all_flowers = all_flowers;
        });
  }

  ngOnInit(): void {
    this.loadCSV()
  }
}
