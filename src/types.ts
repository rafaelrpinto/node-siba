export interface HotelUnit {
  nipc: string;
  establishment: string;
  accessKey: string;
  name: string;
  abbreviation: string;
  address: string;
  location: string;
  zipCode: string;
  zipZone: string;
  phone: string;
  fax?: string;
  contactName: string;
  contactEmail: string;
}

export enum GuestDocumentType {
  PASSPORT = "P",
  ID_CARD = "B",
  OTHER = "O"
}

export interface GuestDocument {
  number: string;
  issuingCountry: string;
  type: GuestDocumentType;
}

export interface Guest {
  firstName: string;
  surname?: string;
  nationality: string;
  birthDate: Date;
  birthPlace?: string;
  checkInDate: Date;
  checkOutDate?: Date;
  countryOfResidence: string;
  placeOfResidence: string;
  document: GuestDocument;
}

export interface AccommodationBulletin {
  number: number;
  issueDate: Date;
  hotelUnit: HotelUnit;
  guests: Guest[];
}

export interface SIBAResponse {
  isSuccess: boolean;
  code: string;
  errorLine?: string;
  errorMessage?: string;
}
