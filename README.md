# node-siba

![Build Status](https://travis-ci.org/rafaelrpinto/node-siba.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/rafaelrpinto/node-siba/badge.svg?branch=master)](https://coveralls.io/github/rafaelrpinto/node-siba?branch=master) [![Code Climate](https://codeclimate.com/github/rafaelrpinto/node-siba.svg)](https://codeclimate.com/github/rafaelrpinto/node-siba)

Utility library that creates a SIBA webservice request without coupling with HTTP/SOAP clients.

## Motivation

This project's goal is to facilitate the integration with SIBA, the Portuguese border control system for foreigns seeking accomodation in Portugal (Hotels or Alojamento Local). More info at [SIBA's Portal](https://siba.sef.pt/).

Since each project may make HTTP requests using different libraries / versions this project is limited to generating the webservice SOAP request and the model involved in the task.

## Installation

```bash
yarn add node-siba
```

or

```bash
npm install node-siba
```

## Usage

This module exports two functions: `buildSIBARequestXML` and `parseSIBAXMLResponse`.

This just builds the SOAP XML request.

```javascript
import { buildSIBARequestXML, GuestDocumentType } from "node-siba";

const bulletin = {
  number: 1,
  issueDate: new Date(),
  hotelUnit: {
    nipc: "121212121",
    establishment: "00",
    accessKey: "999999999",
    name: "A Hotel",
    abbreviation: "ABV",
    address: "An address",
    location: "A Location",
    zipCode: "4050",
    zipZone: "175",
    phone: "999888777",
    fax: "299888777",
    contactName: "A Name",
    contactEmail: "email@test.com"
  },
  guest: {
    firstName: "John",
    surname: "Doe",
    nationality: "AFG",
    birthDate: new Date("2009-01-01T10:00:00Z"),
    birthPlace: "A place",
    checkInDate: new Date("2019-01-01T10:00:00Z"),
    checkOutDate: new Date("2019-01-03T10:00:00Z"),
    countryOfResidence: "AFG",
    placeOfResidence: "A place",
    document: {
      number: "ABCD1234",
      issuingCountry: "AFG",
      type: GuestDocumentType.PASSPORT
    }
  }
};

const soapRequest = buildSIBARequestXML(bulletin);
console.log(soapRequest);
```

Console output:

```xml
<Envelope xmlns="http://www.w3.org/2003/05/soap-envelope">
   <Header/>
   <Body>
      <EntregaBoletinsAlojamento xmlns="http://sef.pt/">
         <UnidadeHoteleira>121212121</UnidadeHoteleira>
         <Estabelecimento>00</Estabelecimento>
         <ChaveAcesso>999999999</ChaveAcesso>
         <Boletins>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48TW92aW1lbnRvQkFMIHhtbG5zPSJodHRwOi8vc2VmLnB0L0JBd3MiPjxVbmlkYWRlX0hvdGVsZWlyYT48Q29kaWdvX1VuaWRhZGVfSG90ZWxlaXJhPjEyMTIxMjEyMTwvQ29kaWdvX1VuaWRhZGVfSG90ZWxlaXJhPjxFc3RhYmVsZWNpbWVudG8+MDA8L0VzdGFiZWxlY2ltZW50bz48Tm9tZT5BIEhvdGVsPC9Ob21lPjxBYnJldmlhdHVyYT5BQlY8L0FicmV2aWF0dXJhPjxNb3JhZGE+QW4gYWRkcmVzczwvTW9yYWRhPjxMb2NhbGlkYWRlPkEgTG9jYXRpb248L0xvY2FsaWRhZGU+PENvZGlnb19Qb3N0YWw+NDA1MDwvQ29kaWdvX1Bvc3RhbD48Wm9uYV9Qb3N0YWw+MTc1PC9ab25hX1Bvc3RhbD48VGVsZWZvbmU+OTk5ODg4Nzc3PC9UZWxlZm9uZT48RmF4PjI5OTg4ODc3NzwvRmF4PjxOb21lX0NvbnRhY3RvPkEgTmFtZTwvTm9tZV9Db250YWN0bz48RW1haWxfQ29udGFjdG8+ZW1haWxAdGVzdC5jb208L0VtYWlsX0NvbnRhY3RvPjwvVW5pZGFkZV9Ib3RlbGVpcmE+PEJvbGV0aW1fQWxvamFtZW50bz48QXBlbGlkbz5Kb2huPC9BcGVsaWRvPjxOb21lPkRvZTwvTm9tZT48TmFjaW9uYWxpZGFkZT5BRkc8L05hY2lvbmFsaWRhZGU+PERhdGFfTmFzY2ltZW50bz4yMDA5LTAxLTAxVDEwOjAwOjAwLjAwMFo8L0RhdGFfTmFzY2ltZW50bz48TG9jYWxfTmFzY2ltZW50bz5BIHBsYWNlPC9Mb2NhbF9OYXNjaW1lbnRvPjxEb2N1bWVudG9fSWRlbnRpZmljYWNhbz5BQkNEMTIzNDwvRG9jdW1lbnRvX0lkZW50aWZpY2FjYW8+PFBhaXNfRW1pc3Nvcl9Eb2N1bWVudG8+QUZHPC9QYWlzX0VtaXNzb3JfRG9jdW1lbnRvPjxUaXBvX0RvY3VtZW50bz5QPC9UaXBvX0RvY3VtZW50bz48RGF0YV9FbnRyYWRhPjIwMTktMDEtMDFUMTA6MDA6MDAuMDAwWjwvRGF0YV9FbnRyYWRhPjxEYXRhX1NhaWRhPjIwMTktMDEtMDNUMTA6MDA6MDAuMDAwWjwvRGF0YV9TYWlkYT48UGFpc19SZXNpZGVuY2lhX09yaWdlbT5BRkc8L1BhaXNfUmVzaWRlbmNpYV9PcmlnZW0+PExvY2FsX1Jlc2lkZW5jaWFfT3JpZ2VtPkEgcGxhY2U8L0xvY2FsX1Jlc2lkZW5jaWFfT3JpZ2VtPjwvQm9sZXRpbV9BbG9qYW1lbnRvPjxFbnZpbz48TnVtZXJvX0ZpY2hlaXJvPjE8L051bWVyb19GaWNoZWlybz48RGF0YV9Nb3ZpbWVudG8+MjAxOS0wMS0yNFQyMDowMzo0NS4wNjJaPC9EYXRhX01vdmltZW50bz48L0VudmlvPjwvTW92aW1lbnRvQkFMPg==</Boletins>
      </EntregaBoletinsAlojamento>
   </Body>
</Envelope>
```

With the request built it's possible to call SIBA's webservice using any HTTP client, ex:

```javascript
import {
  buildSIBARequestXML,
  parseSIBAXMLResponse,
  GuestDocumentType
} from "node-siba";
const fetch = require("node-fetch");

const bulletin = {
  // same structure as the example above
};

// generates the SOAP Envelope
const body = buildSIBARequestXML(bulletin);

// calls SIBA's dev environment using fetch (could be done with axios, request, etc)
const response = await fetch(
  "https://siba.sef.pt/bawsdev/boletinsalojamento.asmx",
  {
    body,
    method: "post",
    headers: {
      "Content-Type": "text/xml",
      SOAPAction: "http://sef.pt/EntregaBoletinsAlojamento"
    }
  }
);
const xmlResponse = await response.text();

// Parses the XML response into an object
const sibaREsponse = parseSIBAXMLResponse(xmlResponse);

console.log(sibaREsponse);
```

SIBA's response object has the folowing structure:

```typescript
interface SIBAResponse {
  isSuccess: boolean;
  code: string;
  errorLine?: string;
  errorMessage?: string;
}
```
