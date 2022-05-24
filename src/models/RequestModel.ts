import Circle from "./CircleModel";
import Polygon from "./PolygonModel";
import ObjectsContainer from "./ObjectsContainer";

export default class CalculationRequest extends ObjectsContainer {

  private parameter: number = 0.;
  private building_lat: number = 0.;
  private building_lon: number = 0.;

  private type: string = "";

  constructor(parameter: number, building_lat: number, building_lon: number, type: string, circles: Circle[], polygons: Polygon[]) {
    super(circles, polygons);
    this.parameter = parameter;
    this.building_lat = building_lat;
    this.building_lon = building_lon;
    this.type = type;
  }
}
