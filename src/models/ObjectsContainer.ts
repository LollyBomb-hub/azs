import Circle from "./CircleModel";
import Polygon from "./PolygonModel";

export default class ObjectsContainer {

  private circles: Circle[] = [];
  private polygons: Polygon[] = [];

  constructor(circles: Circle[], polygons: Polygon[]) {
    this.circles = circles;
    this.polygons = polygons;
  }

  public addCircle(c: Circle) {
    this.circles.push(c);
  }

  public addPolygon(p: Polygon) {
    this.polygons.push(p);
  }

  public removeCircle(c: Circle) {
    this.circles = this.circles.filter(obj => {return obj != c;});
  }

  public removePolygon(p: Polygon) {
    this.polygons = this.polygons.filter(obj => {return obj != p;});
  }

  get Circles() {
    return this.circles;
  }

  get Polygons() {
    return this.polygons;
  }
}
