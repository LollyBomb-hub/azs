import * as L from 'leaflet';

export default class Circle {
  private _x0: number = 0.; // latitude
  private _y0: number = 0.; // longitude
  private _r: number = 0.; // given in meters

  constructor(x0: number, y0: number, r: number) {
    this._x0 = x0;
    this._y0 = y0;
    this._r = r;
  }

  public toLeafletModel(): L.Circle {
    return new L.Circle(new L.LatLng(this.x0, this.y0), this.r);
  }

  get x0(): number {
    return this._x0;
  }

  get y0(): number {
    return this._y0;
  }

  get r(): number {
    return this._r;
  }

  set x0(value: number) {
    this._x0 = value;
  }

  set y0(value: number) {
    this._y0 = value;
  }

  set r(value: number) {
    this._r = value;
  }
}
