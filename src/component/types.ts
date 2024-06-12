export interface Recipe {
    image: string | null;
    title: string;
    ingredients: string;
    instructions: string;
    preparationTime: number;
    favorite: boolean;
  }
  export {};