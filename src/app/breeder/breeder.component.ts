import { HostListener, Component, OnInit } from '@angular/core';
import * as flower from '../flower';
import * as Log from '../logger';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-breeder',
  templateUrl: './breeder.component.html',
  styleUrls: ['./breeder.component.scss']
})

export class BreederComponent implements OnInit {
  breed_success_rate = .5;
  max_saved = 10;

  all_possible_flowers: flower.Flower[] = [];
  seed_flowers: flower.Flower[] = [];
  isle_flowers: flower.Flower[] = [];
  saved_flowers: flower.Flower[] = new Array(this.max_saved).fill(flower.blankFlower);
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
  focused_possibilities: Object[] = [];
  curr_par_id: number = 0;

  //empty constructor, moved to OnInit
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    try {
      let focx = this.focused_flower.x;
      let focy = this.focused_flower.y;
      switch (event.keyCode) {
        case 65: // A
          this.grid[focx][focy-1].type !== flower.FlowerType.Blank ? this.putFlowerInFocus(focx, focy-1) : null;
          break;
        case 87: // W
          this.grid[focx-1][focy].type !== flower.FlowerType.Blank ?this.putFlowerInFocus(focx-1, focy) : null;
          break;
        case 68: // D
          this.grid[focx][focy+1].type !== flower.FlowerType.Blank ? this.putFlowerInFocus(focx, focy+1) : null;
          break;
        case 83: // S
          this.grid[focx+1][focy].type !== flower.FlowerType.Blank ? this.putFlowerInFocus(focx+1, focy) : null;
          break;
      }
    }
    catch (e) {} // Either there is no flower in focus or we are at grid boundaries. Not important to handle.
  }
  
  emptySavedFlowers() {
    this.saved_flowers = new Array(this.max_saved).fill(flower.blankFlower);
  }

  loadCSV(): void {
    let text;
    let all_flowers = [];
    
    this.http.get("assets/flowerdata.csv", {responseType: 'text'})
        .subscribe(res => {
          text = res.split('\n').slice(1);
          for (let data of text) {
            let info = data.split(',');
            let type = flower.FlowerType[info[0]];
            let isSeedBag = false;
            let isHybridIsle = false;
            switch (parseInt(info[6])) {
              case 1:
                isSeedBag = true;
                break;
              case 2:
                isHybridIsle = true;
                break;
            }
            all_flowers.push(new flower.Flower({type: type, red_gene: parseInt(info[1]), yellow_gene: parseInt(info[2]), white_gene: parseInt(info[3]), rose_gene: parseInt(info[4]), color: info[5].toLowerCase(), generation: 1, isSeedBag: isSeedBag, isHybrid: isHybridIsle}));
          }
          this.all_possible_flowers = all_flowers;
          this.loadSeedBags();
          Log.info("All base flowers loaded.", "green");
        });
  }

  loadSeedBags(): void {
    for (let flower of this.all_possible_flowers) {
      if (flower.isSeedBag) {
        this.seed_flowers.push(flower);
      }
      else if (flower.isHybridIsle) {
        this.isle_flowers.push(flower);
      }
    }
  }

  onSubmit(gridOptionsData): void {
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

  onReset() {
    this.submitted = false;
    this.gridOptions.reset();
  }

  resetGrid() {
    this.grid = flower.generateGrid(this.gridRows, this.gridColumns);
    this.curr_generation = 1;
    this.focused_flower = flower.blankFlower;
    Log.info(`Grid has been reset to be ${this.gridColumns} x ${this.gridRows}.`, "red");
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
    console.log(this.saved_flowers);
  }

  get flowerValidation () { return this.gridOptions.controls; }

  onFlowerDragged(event: any) {
    let id = event.target.parentElement.id;
    let id_ele = event.target;
    while (id == "") {
      id_ele = id_ele.parentElement;
      id = id_ele.id;
    }
    let ind = id.slice(5).split('-');
    let seedX = parseInt(ind[0]);
    let seedY = parseInt(ind[1]);

    let data;
    let drag_type;
    if (id.includes("area")) {
      data = JSON.stringify(this.grid[seedX][seedY]);
      drag_type = "area";
    }
    else if (id.includes("bags")) {
      data = JSON.stringify(this.seed_flowers[seedX]);
      drag_type = "bags";
    }
    else if (id.includes("save")) {
      data = JSON.stringify(this.saved_flowers[seedX]);
      drag_type = "save";
    }
    else {
      data = JSON.stringify(this.isle_flowers[seedX]);
      drag_type = "isle";
    }
    event.dataTransfer.setData("flower-data", data);
    event.dataTransfer.setData("flower-id", id);
    event.dataTransfer.setData("drag-type", drag_type);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  onFlowerDropped(event: any) {
    event.preventDefault();
    let id = event.target.id;
    let id_ele = event.target;
    // ensures that no matter where the user drags the flower wil be replaced
    if (id === "saved") {
      id_ele = event.target.children[0].children[0];
      id = id_ele.id;
    }

    while (id == "") {
      id_ele = id_ele.parentElement;
      id = id_ele.id;
    }
    let drag_type = event.dataTransfer.getData("drag-type");
    let indexes = id.slice(5).split('-');
    if (id.includes("save")) {
      let data = flower.Flower.fromJson(event.dataTransfer.getData("flower-data"));
      console.log(data);
      let bindex = this.saved_flowers.indexOf(flower.blankFlower);
      if (bindex !== -1) {
        this.saved_flowers[bindex] = data;
        this.focused_flower = data;
      }
      else {
        this.saved_flowers[indexes[0]] = data;
        this.focused_flower = data;
      }
    }
    else {
      let deletionFlag = false;
      if (drag_type === "area") {
        deletionFlag = true;
      }
      
      // New location of flower
      let gridX = parseInt(indexes[0]);
      let gridY = parseInt(indexes[1]);

      // Old location of flower
      let ind = event.dataTransfer.getData("flower-id").slice(5).split('-');
      let seedX = parseInt(ind[0]);
      let seedY = parseInt(ind[1]);
      let newFlower = flower.Flower.fromJson(event.dataTransfer.getData("flower-data"));
      newFlower.x, newFlower.y = gridX, gridY;
      this.grid[gridX][gridY] = newFlower;
      
      if (deletionFlag) {
        this.grid[seedX][seedY] = flower.blankFlower;
      }
      Log.info(`Flower ${deletionFlag ? "in position Grid-(" + seedX + "," + seedY + ")": "from Seed Bag"} has been moved to Grid-(${gridX}, ${gridY}).`, "orange");
    }
  }

  putFlowerInFocus(x, y) {
    this.focused_children = [];
    this.focused_parents = [];
    this.focused_possibilities = [];
    if (this.focused_flower != this.grid[x][y]) {
      this.focused_index = [x, y];
      this.grid[x][y].x = x;
      this.grid[x][y].y = y;
      this.focused_flower = this.grid[x][y];

      for (let i = 0; i < this.gridRows; i++) {
        for (let j = 0; j < this.gridColumns; j++) {
          try {
            for (let par of this.grid[i][j].parents) {
              if (par.opt_id === this.focused_flower.opt_id) {
                this.focused_children.push(this.grid[i][j]);
              }
            }
          } catch {}
        }
      }

      let opt_ids = Array.from(this.focused_flower.parents, x => x.opt_id);
      for (let i = 0; i < this.gridRows; i++) {
        for (let j = 0; j < this.gridColumns; j++) {
          try {
            if (opt_ids.includes(this.grid[i][j].opt_id)) {
              this.focused_parents.push(this.grid[i][j]);
            }
          } catch {}
        }
      }

      let neighbors = flower.findNeighbors(this.grid, x, y);
      for (let n of neighbors) {
        let i = n[0];
        let j = n[1];
        if (i < this.gridRows && j < this.gridColumns) {
          if (this.grid[i][j].type === this.focused_flower.type) {
            let possible_colors = this.focused_flower.generatePossibleChildrenImages(this.grid[i][j], this.all_possible_flowers);
            let location: string;
            if (i === x+1 && j === y-1) {
              location = "Bottom-Left";
            }
            else if (i === x+1 && j === y) {
              location = "Bottom-Center";
            }
            else if (i === x+1 && j === y+1) {
              location = "Bottom-Right";
            }
            else if (i === x-1 && j === y-1) {
              location = "Top-Left";
            }
            else if (i === x-1 && j === y) {
              location = "Top-Center";
            }
            else if (i === x-1 && j === y+1) {
              location = "Top-Right";
            }
            else if (i === x && j === y-1) {
              location = "Center-Left";
            }
            else {
              location = "Center-Right";
            }
            this.focused_possibilities.push({location: location, colors: possible_colors});
            
          }
        }
      }
      for (let item of this.focused_possibilities) {
        console.log(item["location"]);
      }
      console.log(this.focused_possibilities);

      Log.info(`${this.focused_flower.color.toUpperCase()} ${this.focused_flower.type.toUpperCase()} in position (${x}, ${y}) is in focus.`, "green");
    }
    else {
      this.focused_flower = flower.blankFlower;
      Log.info('Focus has been cleared.');
    }
  }

  removeFocusedFlower() {
    for (let x = 0; x < this.gridRows; x++) {
      for (let y = 0; y < this.gridColumns; y++) {
        if (this.grid[x][y].parents.includes(this.focused_flower)) {
          this.grid[x][y].parents.splice(this.grid[x][y].parents.indexOf(this.focused_flower), 1);
        }
      }
    }

    for (let index in this.saved_flowers) {
      if (this.saved_flowers[index].parents.includes(this.focused_flower)) {
        this.saved_flowers[index].parents.splice(this.saved_flowers[index].parents.indexOf(this.focused_flower), 1);
      }
    }

    Log.info(`${this.focused_flower.color.toUpperCase()} ${this.focused_flower.type.toUpperCase()} in position (${this.focused_flower.x}, ${this.focused_flower.y}) has been deleted.`, "red");
    this.focused_flower = flower.blankFlower;
    this.grid[this.focused_index[0]][this.focused_index[1]] = flower.blankFlower;
    this.focused_index = [];
    this.focused_children = [];
    this.focused_parents = [];
    this.focused_possibilities = [];
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
                this.grid[x][y].x = x, this.grid[x][y].y = y;
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
          let neighboring = Array.from(flower.findNeighbors(this.grid, par1.x, par1.y), two => this.grid[two[0]][two[1]]).filter(x => x !== undefined).includes(par2);
          if (par1.type === par2.type && !par1.has_bred && !par2.has_bred && neighboring) {
            // this spot is free and ready to be breeded
            if (this.grid[x][y].type === flower.FlowerType.Blank) {
              if (Math.random() <= this.breed_success_rate) {
                let res = par1.breed(par2, this.all_possible_flowers.filter(fl => fl.type === par1.type), this.curr_generation);
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
                par1.has_bred = true;
                par2.has_bred = true;
                Log.info(`${par1.color.toUpperCase()} ${par1.type.toUpperCase()} (${par1.x}, ${par1.y}) and ${par2.color.toUpperCase()} ${par2.type.toUpperCase()} (${par2.x}, ${par2.y}) successfully bred ${res.color.toUpperCase()} ${res.type.toUpperCase()} (${res.x}, ${res.y}) with genes RED-${res.genes["red"]} YELLOW-${res.genes["yellow"]} WHITE-${res.genes["white"]} ROSE-${res.genes["rose"]}.`, "blue");
              }
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
