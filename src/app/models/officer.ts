export interface Officer {
    name: string;
    surname: string;
    identityNumber: number;
    reportDate: string;
    position: string;
    signature: any[];
    reportAddress: string;
    questions: any[];
    answers: any[];
    photos: any[];
    videos: any[];
    audios: any[];
}
export interface OfficerInformationsForGetData {
    name: string;
    surname: string;
    identityNumber: number;
    reportDate: string
}

