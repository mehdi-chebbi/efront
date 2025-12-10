export interface Quiz {
  titre: string;
  questions: {
    text: string;
    options: string[];
    correctOption: number;
  }[];
}
