import * as L from 'leaflet';

export default class Polygon {

  private _latlngs: number[][] = [];

  constructor(xs: number[], ys: number[]) {
    let length = xs.length;
    for (let i = 0; i < length; i++) {
      let latlng = Array.of(xs[i], ys[i]);
      this._latlngs.push(latlng);
    }
  }

  get latlngs(): number[][] {
    return this._latlngs;
  }

  toLeafletModel() {
    let latlngsModel: L.LatLng[] = [];

    for (let i = 0; i < this.latlngs.length; i++) {
      latlngsModel.push(new L.LatLng(this.latlngs[i][0], this.latlngs[i][1]));
    }

    return new L.Polygon(latlngsModel);
  }
}
