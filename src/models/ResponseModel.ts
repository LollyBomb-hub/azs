import * as L from 'leaflet';
import Circle from "./CircleModel";

export default class Response {

  private firstRadius: number = 0.;
  private secondRadius: number = 0.;
  private thirdRadius: number = 0.;
  private fourthRadius: number = 0.;
  private fifthRadius: number = 0.;

  get R1() {
    return this.firstRadius;
  }

  get R2() {
    return this.secondRadius;
  }

  get R3() {
    return this.thirdRadius;
  }

  get R4() {
    return this.fourthRadius;
  }

  get R5() {
    return this.fifthRadius;
  }

  getR1Model(lat: number, lng: number) {
    return new Circle(lat, lng, this.R1);
  }

  getR2Model(lat: number, lng: number) {
    return new Circle(lat, lng, this.R2);
  }

  getR3Model(lat: number, lng: number) {
    return new Circle(lat, lng, this.R3);
  }

  getR4Model(lat: number, lng: number) {
    return new Circle(lat, lng, this.R4);
  }

  getR5Model(lat: number, lng: number) {
    return new Circle(lat, lng, this.R5);
  }

}
