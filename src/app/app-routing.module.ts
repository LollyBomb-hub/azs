import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LeafletMapComponent} from "./leaflet-map/leaflet-map.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full"},
  { path: "home", component: HomeComponent },
  { path: "map/:lat/:lon", component: LeafletMapComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
