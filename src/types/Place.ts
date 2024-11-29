// types/Place.ts

export type Place = {
    id: number;
    lat: number;
    lon: number;
    tags: {
      name?: string;
      cuisine?: string;
      [key: string]: string | undefined; // For any additional unknown tags
    };
  };
  