import { Component, OnInit } from '@angular/core';
//import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { HttpClient } from '@angular/common/http';
import * as flower from '../flower';
//import { DragSourceRenderer } from './drag-source-renderer.component';

@Component({
  selector: 'display-app',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent {
  public gridApi;
  public gridColumnApi;

  public rowClassRules;
  public defaultColDef;
  public grid;
  rowData : any;

//Type,Red Value,Yellow Value,White Value,??? Value,Color,Seed Bag
  columnDefs = [
    { headerName:'Type', field: 'Type', sortable:true, dndSource: true},
    { headerName:'Red Value', field: 'Red Value' },
    { headerName:'Yellow Value', field: 'Yellow Value' },
    { headerName:'White Value', field: 'White Value'},
    { headerName:'???', field: '??? Value' },
    { headerName:'Color', field: 'Color'},
    { headerName:'Seed Bag', field: 'Seed Bag', sortable:true }    
  ];

  public frameworkComponents;

  constructor(private http: HttpClient){
    
  }

  ngOnInit(){
    this.rowData = this.http.get("assets/flowerdata.json");
    this.grid = flower.generateGrid(5, 5);
  }

  onDragOver(event) {
    var types = event.dataTransfer.types;
    var dragSupported = types.length;
    if (dragSupported) {
      event.dataTransfer.dropEffect = 'move';
    }
    event.preventDefault();
  }

  onDrop(event) {
    event.preventDefault();
    var userAgent = window.navigator.userAgent;
    var isIE = userAgent.indexOf('Trident/') >= 0;
    var textData = event.dataTransfer.getData(isIE ? 'text' : 'text/plain');
    var eJsonRow = document.createElement('div');
    eJsonRow.classList.add('json-row');
    eJsonRow.innerText = textData;
    var eJsonDisplay = document.querySelector('#eJsonDisplay');
    eJsonDisplay.appendChild(eJsonRow);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
}

var rowIdSequence = 100;
function createRowData() {
  var data = [];
  [
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
  ].forEach(function(color) {
    var newDataItem = {
      id: rowIdSequence++,
      color: color,
      value1: Math.floor(Math.random() * 100),
      value2: Math.floor(Math.random() * 100),
    };
    data.push(newDataItem);
  });
  return data;
}