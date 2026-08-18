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
