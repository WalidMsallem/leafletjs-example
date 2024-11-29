export type Place = {
    id: number;
    lat: number;
    lon: number;
    tags: {
      amenity?: string;
      cuisine?: string;
      name?: string;
      website?: string;
      phone?: string;
      address?: string;
      [key: string]: any;
    };
  };
  