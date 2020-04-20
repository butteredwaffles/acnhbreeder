import { Component, OnInit } from '@angular/core';
import * as flower from '../flower';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-breeder',
  templateUrl: './breeder.component.html',
  styleUrls: ['./breeder.component.scss']
})

export class BreederComponent implements OnInit {
  breed_success_rate = .5;
  all_possible_flowers: flower.Flower[] = [];
  seed_flowers: flower.Flower[] = [];
  gridOptions;
  gridRows: number = 5;
  gridColumns: number = 5;
  grid;
  submitted;
  curr_generation: number = 1;
  focused_index;
  focused_flower = flower.blankFlower;
  focused_children: flower.Flower[] = [];
  focused_parents: flower.Flower[] = [];
  curr_par_id: number = 0;

  getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
  

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
            all_flowers.push(new flower.Flower({type: type, red_gene: parseInt(info[1]), yellow_gene: parseInt(info[2]), white_gene: parseInt(info[3]), rose_gene: parseInt(info[4]), color: info[5].toLowerCase(), generation: 1, isSeedBag: info[6] == 1 ? true : false}));
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
    this.breed_success_rate = gridOptionsData.breedrate;
    
    this.resetGrid();
  }

  //so it doesnt gets hecced on refresh
  onReset() {
    this.submitted = false;
    this.gridOptions.reset();
  }

  resetGrid() {
    this.grid = flower.generateGrid(this.gridRows, this.gridColumns);
    this.curr_generation = 1;
    this.focused_flower = flower.blankFlower;
  }

  ngOnInit(): void {
    this.loadCSV();
    this.resetGrid();

    // loads validation and default values, makes validators required
    this.gridOptions = this.formBuilder.group({
      rows: [this.gridRows, [Validators.required, Validators.min(3), Validators.max(15)]],
      columns: [this.gridColumns, [Validators.required, Validators.min(3), Validators.max(15)]],
      breedrate: [this.breed_success_rate, [Validators.required, Validators.min(0.01), Validators.max(1.0)]]
    });
    //flower.findNeighbors(this.grid, 0, 0);
  }

  //get Form for validation bullhecc in html, ppl usually use just "f" tho
  get flowerValidation () { return this.gridOptions.controls; }

  // updateGrid() {
  //   for (let x = 0; x < this.gridRows; x++) {
  //     for (let y = 0; y < this.gridColumns; y++) {
  //       let flo = this.grid[x][y];
  //       for (let parent of flo.parents) {
  //         if (this.grid[parent.x][parent.y]) !=
  //       }
  //     }
  //   }
  // }

  onFlowerDragged(event: any) {
    let id = event.target.parentElement.id;
    let isFromGrid = false;
    let id_ele = event.target;
    while (id == "") {
      id_ele = id_ele.parentElement;
      id = id_ele.id;
      isFromGrid = true;
    }
    let ind = id.slice(5).split('-');
    let seedX = parseInt(ind[0]);
    let seedY = parseInt(ind[1]);
    event.dataTransfer.setData("flower-data", isFromGrid ? JSON.stringify(this.grid[seedX][seedY]) : JSON.stringify(this.seed_flowers[seedX]));
    event.dataTransfer.setData("flower-id", id);
    event.dataTransfer.setData("drag-type", isFromGrid ? "area" : "bags");
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  onFlowerDropped(event: any) {
    let deletionFlag = false;
    event.preventDefault();
    if (event.dataTransfer.getData("drag-type") != "bags") {
      deletionFlag = true;
    }
    let id = event.target.id;
    let id_ele = event.target;
    // ensures that no matter where the user drags the flower wil be replaced
    while (id == "") {
      id_ele = id_ele.parentElement;
      id = id_ele.id;
    }

    // New location of flower
    let indexes = id.slice(5).split('-');
    let gridX = parseInt(indexes[0]);
    let gridY = parseInt(indexes[1]);

    // Old location of flower
    let ind = event.dataTransfer.getData("flower-id").slice(5).split('-');
    let seedX = parseInt(ind[0]);
    let seedY = parseInt(ind[1]);
    this.grid[gridX][gridY] = flower.Flower.fromJson(event.dataTransfer.getData("flower-data"));
    let newFlower: flower.Flower = this.grid[gridX][gridY];
    newFlower.x, newFlower.y = gridX, gridY;
    if (deletionFlag) {
      this.grid[seedX][seedY] = flower.blankFlower;
    }
  }

  putFlowerInFocus(x, y) {
    this.focused_children = [];
    this.focused_parents = [];
    if (this.focused_flower != this.grid[x][y]) {
      this.focused_index = [x, y];
      this.grid[x][y].x = x;
      this.grid[x][y].y = y;
      this.focused_flower = this.grid[x][y];

      for (let i = 0; i < this.gridRows; i++) {
        for (let j = 0; j < this.gridColumns; j++) {
          for (let par of this.grid[i][j].parents) {
            if (par.opt_id === this.focused_flower.opt_id) {
              this.focused_children.push(this.grid[i][j]);
            }
          }
        }
      }

      let opt_ids = Array.from(this.focused_flower.parents, x => x.opt_id);
      for (let i = 0; i < this.gridRows; i++) {
        for (let j = 0; j < this.gridColumns; j++) {
          if (opt_ids.includes(this.grid[i][j].opt_id)) {
            this.focused_parents.push(this.grid[i][j]);
          }
        }
      }
      console.log(this.focused_flower, this.focused_parents);
    }
    else {
      this.focused_flower = flower.blankFlower;
    }
  }

  removeFocusedFlower() {
    for (let x = 0; x < this.gridRows; x++) {
      for (let y = 0; y < this.gridColumns; y++) {
        if (this.grid[x][y].parents.includes(this.focused_flower)) {
          this.grid[x][y].splice(this.grid[x][y].parents.indexOf(this.focused_flower), 1);
        }
      }
    }
    this.focused_flower = flower.blankFlower;
    this.grid[this.focused_index[0]][this.focused_index[1]] = flower.blankFlower;
    this.focused_index = [];
    this.focused_children = [];
    this.focused_parents = [];
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

  pollinate() {
    let pollispaces = {};
    let flowerBred = false;
    // Find spaces that are empty
    for (let x = 0; x < this.gridRows; x++) {
      for (let y = 0; y < this.gridColumns; y++) {
        if (this.grid[x][y].type !== flower.FlowerType.Blank) {
          let neighbors = flower.findNeighbors(this.grid, x, y);
          for (let n of neighbors) {
            let i = n[0];
            let j = n[1];
            if (i < this.gridRows && j < this.gridColumns) {
              if (this.grid[i][j].type === flower.FlowerType.Blank) {
                let istring = i.toString() + ',' + j.toString();
                if (pollispaces[istring] === undefined) {
                  pollispaces[istring] = [];
                }
                pollispaces[istring].push({pollinated_by: this.grid[x][y]});
              }
            }
          }
        }
      }
    }
    for (let space in pollispaces) {
      let sp = space.split(',');
      let x = parseInt(sp[0]);
      let y = parseInt(sp[1]);
      let values = pollispaces[space];
      if (values.length > 1) {
        for (let n = 0; n < values.length-1; n++) {
          let par1: flower.Flower = values[n].pollinated_by;
          let par2: flower.Flower = values[n+1].pollinated_by;
          if (par1.type === par2.type && !par1.has_bred && !par2.has_bred) {
            // this spot is free and ready to be breeded
            if (this.grid[x][y].type === flower.FlowerType.Blank) {
              if (Math.random() <= this.breed_success_rate) {
                let res = par1.breed(par2, this.all_possible_flowers, this.curr_generation);
                res.x = x;
                res.y = y;
                if (par1.opt_id === -1) {
                  par1.opt_id = this.curr_par_id+1;
                  this.curr_par_id += 1;
                }
                if (par2.opt_id === -1) {
                  par2.opt_id = this.curr_par_id+1;
                  this.curr_par_id += 1;
                }
                res.parents.push(par1);
                res.parents.push(par2);
                this.grid[x][y] = res
                flowerBred = true;
              }
              par1.has_bred = true;
              par2.has_bred = true;
            }
          }
        }
      }
    }
    // prepare things for next session
    if (flowerBred) {
      this.curr_generation += 1;
    }
    for (let x = 0; x < this.gridRows; x++) {
      for (let y = 0; y < this.gridColumns; y++) {
        this.grid[x][y].has_bred = false;
      }
    }
  }
  
}
