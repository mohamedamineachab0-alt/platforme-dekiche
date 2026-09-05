declare module "algeria-locations" {
  export interface Commune {
    id: number;
    post_code: string;
    name: string;
    name_ar: string;
    wilaya_id: number;
    latitude: string;
    longitude: string;
  }

  export function getCommunesByWilayaId(wilayaId: number): Commune[];
  export function getWilayas(): any[];
}
