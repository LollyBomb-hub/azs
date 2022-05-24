import {AfterViewInit, Component} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import {ActivatedRoute} from "@angular/router";
import Circle from "../../models/CircleModel";
import Polygon from "../../models/PolygonModel";
import ObjectsContainer from "../../models/ObjectsContainer";

(window as any).type = true;

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css']
})
export class LeafletMapComponent implements AfterViewInit {

  private map: any;
  private isDrawing: boolean = false;
  private isSelectingBuilding: boolean = false;
  private latitude: number = 0.;
  private longitude: number = 0.;
  private zoom: number = 14;
  private layerGroup = L.layerGroup([]);

  constructor(
    private route: ActivatedRoute,
  ) {
    if (this.route.snapshot.queryParamMap.get("building") != null) {
      this.isSelectingBuilding = true;
    }
    if (this.route.snapshot.queryParamMap.get("draw") != null) {
      this.isDrawing = true;
    }
    let zoomFromQuery = this.route.snapshot.queryParamMap.get("zoom");
    if (zoomFromQuery != null) {
      this.zoom = parseInt(zoomFromQuery);
    }
    let item = localStorage.getItem("BUILDING");
    if (item != null) {
      // item is string
      let parsed = JSON.parse(item) as L.LatLng;
      this.latitude = parsed.lat;
      this.longitude = parsed.lng;
    } else {
      let lat = this.route.snapshot.paramMap.get("lat");
      let lon = this.route.snapshot.paramMap.get("lon");
      if (lat != null) {
        this.latitude = parseFloat(lat);
      }
      if (lon != null) {
        this.longitude = parseFloat(lon);
      }
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener("storage", this.storageEventListener.bind(this));
    this.map = L.map(
      "map",
      {
        center: [this.latitude, this.longitude],
        zoom: this.zoom,
        drawControl: this.isDrawing,
        attributionControl: false
      }
    );

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    if (this.isSelectingBuilding) {
      this.map.on("click", (e: any) => {
        let marker = L.marker(e.latlng);
        marker.addTo(this.map);
        localStorage.setItem("BUILDING", JSON.stringify(e.latlng));
      })
    } else {
      L.marker(new L.LatLng(this.latitude, this.longitude, undefined)).addTo(this.map);
    }
    if (this.isDrawing) {
      this.map.on(L.Draw.Event.CREATED, (e: any) => {

        let type = e.layerType;
        let layer = e.layer;

        switch (type) {
          case "circle":
            let circleLatlng = layer._latlng as L.LatLng;
            let circleRadius = layer._mRadius;
            let circle = new Circle(circleLatlng.lat, circleLatlng.lng, circleRadius);
            localStorage.setItem("CREATED", JSON.stringify(circle));
            break;
          case "polygon":
          case "rectangle":
            let latlngs: L.LatLng[] = layer._latlngs[0];
            let xs: number[] = [];
            let ys: number[] = [];
            latlngs.forEach(((el: L.LatLng) => {
              xs.push(el.lat);
              ys.push(el.lng);
            }));
            let polygon: Polygon = new Polygon(xs, ys);
            localStorage.setItem("CREATED", JSON.stringify(polygon))
            break;
          default:
            break;
        }
      })
    }
  }

  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage) {
      try {
        if (event.key == "DRAW" && event.newValue != null) {
          this.layerGroup.eachLayer((layer) => {
            layer.remove();
          })
          let eventNewValue = JSON.parse(event.newValue);
          Object.setPrototypeOf(eventNewValue, ObjectsContainer.prototype);
          let polygons: Polygon[] = eventNewValue.Polygons;
          let circles: Circle[] = eventNewValue.Circles;

          polygons.forEach((poly: any) => {
            Object.setPrototypeOf(poly, Polygon.prototype);
            poly.toLeafletModel().addTo(this.layerGroup);
          })

          circles.forEach((circle: any) => {
            Object.setPrototypeOf(circle, Circle.prototype)
            circle.toLeafletModel().addTo(this.layerGroup);
          })

          this.layerGroup.addTo(this.map);
        }
      } catch (e) {
        console.log(e);
        console.log("Exception parsing given value")
      }
    }
  }

}
