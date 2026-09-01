export interface MeteoGaliciaTideEvent {
  hora: string;
  tipoMarea: 'Preamar' | 'Baixamar';
  altura: number;
}

export interface MeteoGaliciaDayResponse {
  data: string;
  listaMareas: MeteoGaliciaTideEvent[];
}

export interface MeteoGaliciaResponse {
  mareas: MeteoGaliciaDayResponse[];
}

export enum TideType {
  PLEAMAR = 'PLEAMAR',
  BAJAMAR = 'BAJAMAR',
}

export interface TideResponse {
  id: number;
  stationName: string;
  portName: string;
  tideDateTime: Date;
  type: TideType;
  height: number;
}

export interface CurrentTideStatus {
  currentHeight: number;
  status: 'SUBINDO' | 'BAIXANDO';
  previousTide: TideResponse;
  nextTide: TideResponse;
  progressPercentage: number;
}
