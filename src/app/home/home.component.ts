import {Component, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import * as L from 'leaflet';
import Circle from "../../models/CircleModel";
import Polygon from "../../models/PolygonModel";
import CalculationRequest from "../../models/RequestModel";
import ObjectsContainer from "../../models/ObjectsContainer";
import Response from "../../models/ResponseModel";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public lat: number = 0.;
  public lon: number = 0.;
  public zoom = 14;
  private functionalParameter: number = 0.;
  public mapSrc: string = "map/" + this.lat + "/" + this.lon;
  private onSubject = new Subject<{ key: string, value: any }>();
  public objects: any[] = [];

  private circles: Circle[] = [];
  private polygons: Polygon[] = [];

  private draw: ObjectsContainer = new ObjectsContainer([], []);
  public result: any[] = [];

  selectButtonColor: string = "primary";
  isSelecting: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    window.addEventListener("storage", this.storageEventListener.bind(this));
    let item = localStorage.getItem("BUILDING");
    if (item != null) {
      // item is string
      let parsed = JSON.parse(item) as L.LatLng;
      this.lat = parsed.lat;
      this.lon = parsed.lng;
    }
  }

  public selectTarget(): void {
    this.isSelecting = this.selectButtonColor == "primary";
    if (this.isSelecting) {
      let mapFrameElement = document.getElementById("mapContainer") as HTMLIFrameElement;
      mapFrameElement.src = "/map/" + this.lat + "/" + this.lon + "?building=true&zoom=" + this.zoom;
    }
    this.selectButtonColor = this.isSelecting ? "warn" : "primary";
  }

  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage) {
      let eventNewValue;
      try {
        if (event.newValue != null) {
          eventNewValue = JSON.parse(event.newValue);
        }
      } catch (e) {
        console.log("Exception parsing given value")
      }

      switch (event.key) {
        case "BUILDING":
          if (event.key != null) {
            this.onSubject.next({key: event.key, value: eventNewValue});
          }
          let parsed = eventNewValue as L.LatLng;
          this.lat = parsed.lat;
          this.lon = parsed.lng;
          (document.getElementById("lon") as HTMLInputElement).value = this.lat.toString();
          (document.getElementById("lat") as HTMLInputElement).value = this.lon.toString();
          this.isSelecting = false;
          this.selectButtonColor = "primary";
          break;
        case "CREATED":
          if (eventNewValue._r != null) {
            // circle
            let parsed = new Circle(eventNewValue._x0, eventNewValue._y0, eventNewValue._r);
            this.objects.push(
              {
                isShowing: false,
                type: "Округ",
                value: parsed
              }
            );
            this.circles.push(parsed);
            console.log(parsed);
          } else {
            // Polygon
            let parsed = eventNewValue as Polygon;
            this.objects.push(
              {
                isShowing: false,
                type: "Полигон",
                value: parsed
              }
            );
            this.polygons.push(parsed);
            console.log("Polygon", parsed);
          }
          break;
      }
      this.mapSrc = "map/" + this.lat + "/" + this.lon + "?zoom=" + this.zoom;
      (document.getElementById("mapContainer") as HTMLIFrameElement).src = this.mapSrc;
    }
  }

  updateLat() {
    this.lat = parseFloat((document.getElementById("lat") as HTMLInputElement).value);
  }

  updateLon() {
    this.lon = parseFloat((document.getElementById("lon") as HTMLInputElement).value);
  }

  updateZoom() {
    this.zoom = parseInt((document.getElementById("zoom") as HTMLInputElement).value);
    let mapFrameElement = document.getElementById("mapContainer") as HTMLIFrameElement;
    mapFrameElement.src = "/map/" + this.lat + "/" + this.lon + "?zoom=" + this.zoom;
  }

  startDrawing() {
    this.zoom = parseInt((document.getElementById("zoom") as HTMLInputElement).value);
    let mapFrameElement = document.getElementById("mapContainer") as HTMLIFrameElement;
    mapFrameElement.src = "/map/" + this.lat + "/" + this.lon + "?draw=true&zoom=" + this.zoom;
  }

  show(item: any) {
    if (item.isShowing) {
      if (item.type == "Полигон") {
        this.draw.removePolygon(item.value);
      } else {
        this.draw.removeCircle(item.value);
      }
    } else {
      if (item.type == "Полигон") {
        this.draw.addPolygon(item.value);
      } else {
        this.draw.addCircle(item.value);
      }
    }
    item.isShowing = !item.isShowing;
    localStorage.setItem("DRAW", JSON.stringify(this.draw));
  }

  redraw(index: number, item: any) {
    // if value is changed
    return item.value;
  }

  sendRequest(type: string) {
    this.getFunctionalParameter(type);
    let calculationRequest = new CalculationRequest(this.functionalParameter, this.lat, this.lon, type, this.circles, this.polygons);
    fetch(
      "http://localhost:8080/api/calculate",
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(calculationRequest)
      }
    ).then((response) => {
      return response.json()
    })
      .then((data) => {
        Object.setPrototypeOf(data, Response.prototype);
        console.log(data);
        let models: Circle[] = [];
        this.result = [];
        models.push(data.getR1Model(this.lat, this.lon))
        models.push(data.getR2Model(this.lat, this.lon))
        models.push(data.getR3Model(this.lat, this.lon))
        models.push(data.getR4Model(this.lat, this.lon))
        models.push(data.getR5Model(this.lat, this.lon))
        if (data.firstRadiusShape) {
          Object.setPrototypeOf(data.firstRadiusShape, Polygon.prototype);
          this.result.push(
            {
              isShowing: false,
              type: "Полигон",
              description: "Округ (R" + (-1) + ")",
              value: data.firstRadiusShape
            }
          );
        }
        for (let index = 0; index < models.length; index++) {
          let model: Circle = models[index];
          this.result.push(
            {
              isShowing: false,
              type: "Округ",
              description: "Округ (R" + (index + 1) + ")",
              value: model
            }
          );
        }
      });
  }

  readyButtonClicked() {
    let mapFrameElement = document.getElementById("mapContainer") as HTMLIFrameElement;
    localStorage.setItem("BUILDING", JSON.stringify(new L.LatLng(this.lat, this.lon, undefined)));
    mapFrameElement.src = "/map/" + this.lat + "/" + this.lon + "?zoom=" + this.zoom;
  }

  deleteObject(item: any) {
    this.objects = this.objects.filter(obj => {
      return obj !== item;
    });
    if (item.type == "Полигон") {
      this.draw.removePolygon(item.value);
    } else {
      this.draw.removeCircle(item.value)
    }
    localStorage.setItem("DRAW", JSON.stringify(this.draw));
  }

  getFunctionalParameter(id: string) {
    this.functionalParameter = parseFloat((document.getElementById(id) as HTMLInputElement).value)
  }

  redrawResult(index: number, item: any) {
    return item.value;
  }
}
