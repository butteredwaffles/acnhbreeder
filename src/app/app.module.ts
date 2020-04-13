import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BreederComponent } from './breeder/breeder.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DisplayComponent } from './display/display.component';
import { DragSourceRenderer } from './display/drag-source-renderer.component';

// ag-grid
import { AgGridModule } from 'ag-grid-angular';


@NgModule({
  declarations: [
    AppComponent,
    BreederComponent,
    DisplayComponent,
    DragSourceRenderer
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    AgGridModule.withComponents([DragSourceRenderer])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
