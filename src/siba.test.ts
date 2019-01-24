const fetch = require("node-fetch");
import xmlJs = require("xml-js");
import { AccommodationBulletin, GuestDocumentType } from "./types";
import {
  buildSIBASoapEnvelope,
  buildSIBARequestXML,
  parseSIBAXMLResponse
} from "./siba";

const bulletin: AccommodationBulletin = {
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

test("should generate a valid SIBA envelope", () => {
  const { Envelope } = buildSIBASoapEnvelope(bulletin);
  expect(Envelope).toBeDefined();
  expect(Envelope.Header).toBeDefined();
  expect(Envelope.Body).toBeDefined();

  const { EntregaBoletinsAlojamento } = Envelope.Body;
  expect(EntregaBoletinsAlojamento).toBeDefined();
  expect(EntregaBoletinsAlojamento.UnidadeHoteleira).toBe(
    bulletin.hotelUnit.nipc
  );
  expect(EntregaBoletinsAlojamento.Estabelecimento).toBe(
    bulletin.hotelUnit.establishment
  );
  expect(EntregaBoletinsAlojamento.ChaveAcesso).toBe(
    bulletin.hotelUnit.accessKey
  );

  const decodedBulletins = Buffer.from(
    EntregaBoletinsAlojamento.Boletins,
    "base64"
  ).toString("utf-8");

  const bulletins = xmlJs.xml2js(decodedBulletins, {
    compact: true,
    textKey: "value"
  });
  expect(bulletins).toBeDefined();

  // @ts-ignore
  const { MovimentoBAL } = bulletins;

  expect(MovimentoBAL).toBeDefined();

  const { Unidade_Hoteleira, Boletim_Alojamento, Envio } = MovimentoBAL;

  expect(Unidade_Hoteleira.Abreviatura.value).toBe(
    bulletin.hotelUnit.abbreviation
  );
  expect(Unidade_Hoteleira.Codigo_Postal.value).toBe(
    bulletin.hotelUnit.zipCode
  );
  expect(Unidade_Hoteleira.Codigo_Unidade_Hoteleira.value).toBe(
    bulletin.hotelUnit.nipc
  );
  expect(Unidade_Hoteleira.Email_Contacto.value).toBe(
    bulletin.hotelUnit.contactEmail
  );
  expect(Unidade_Hoteleira.Estabelecimento.value).toBe(
    bulletin.hotelUnit.establishment
  );
  expect(Unidade_Hoteleira.Fax.value).toBe(bulletin.hotelUnit.fax);
  expect(Unidade_Hoteleira.Localidade.value).toBe(bulletin.hotelUnit.location);
  expect(Unidade_Hoteleira.Morada.value).toBe(bulletin.hotelUnit.address);
  expect(Unidade_Hoteleira.Nome.value).toBe(bulletin.hotelUnit.name);
  expect(Unidade_Hoteleira.Nome_Contacto.value).toBe(
    bulletin.hotelUnit.contactName
  );
  expect(Unidade_Hoteleira.Telefone.value).toBe(bulletin.hotelUnit.phone);
  expect(Unidade_Hoteleira.Zona_Postal.value).toBe(bulletin.hotelUnit.zipZone);

  expect(Boletim_Alojamento.Apelido.value).toBe(bulletin.guest.firstName);
  expect(Boletim_Alojamento.Data_Entrada.value).toBe(
    bulletin.guest.checkInDate.toISOString()
  );
  expect(Boletim_Alojamento.Data_Nascimento.value).toBe(
    bulletin.guest.birthDate.toISOString()
  );

  expect(Boletim_Alojamento.Data_Saida.value).toBe(
    bulletin.guest.checkOutDate && bulletin.guest.checkOutDate.toISOString()
  );

  expect(Boletim_Alojamento.Documento_Identificacao.value).toBe(
    bulletin.guest.document.number
  );
  expect(Boletim_Alojamento.Local_Nascimento.value).toBe(
    bulletin.guest.birthPlace
  );
  expect(Boletim_Alojamento.Local_Residencia_Origem.value).toBe(
    bulletin.guest.placeOfResidence
  );
  expect(Boletim_Alojamento.Nacionalidade.value).toBe(
    bulletin.guest.nationality
  );
  expect(Boletim_Alojamento.Nome.value).toBe(bulletin.guest.surname);
  expect(Boletim_Alojamento.Pais_Emissor_Documento.value).toBe(
    bulletin.guest.document.issuingCountry
  );
  expect(Boletim_Alojamento.Pais_Residencia_Origem.value).toBe(
    bulletin.guest.countryOfResidence
  );
  expect(Boletim_Alojamento.Tipo_Documento.value).toBe(
    bulletin.guest.document.type
  );
});

test("should parse SIBA success response correctly", () => {
  const successResponse =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
    '<soap:Body><EntregaBoletinsAlojamentoResponse xmlns="http://sef.pt/">' +
    "<EntregaBoletinsAlojamentoResult>0</EntregaBoletinsAlojamentoResult>" +
    "</EntregaBoletinsAlojamentoResponse></soap:Body></soap:Envelope>";

  const sibaResponse = parseSIBAXMLResponse(successResponse);
  expect(sibaResponse).toBeDefined();
  expect(sibaResponse.isSuccess).toBeTruthy();
  expect(sibaResponse.code).toBe("0");
  expect(sibaResponse.errorLine).toBeUndefined();
  expect(sibaResponse.errorMessage).toBeUndefined();
});

test("should parse SIBA error response correctly", () => {
  const successResponse =
    '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><EntregaBoletinsAlojamentoResponse xmlns="http://sef.pt/"><EntregaBoletinsAlojamentoResult>&lt;ErrosBA xmlns="http://www.sef.pt/BAws"&gt;' +
    "&lt;RetornoBA&gt;" +
    "&lt;Linha&gt;0&lt;/Linha&gt;" +
    "&lt;Codigo_Retorno&gt;60&lt;/Codigo_Retorno&gt;" +
    "&lt;Descricao&gt;Não foi possível autenticar a Unidade Hoteleira&lt;/Descricao&gt;" +
    "&lt;/RetornoBA&gt;" +
    "&lt;/ErrosBA&gt;</EntregaBoletinsAlojamentoResult></EntregaBoletinsAlojamentoResponse></soap:Body></soap:Envelope>";

  const sibaResponse = parseSIBAXMLResponse(successResponse);
  expect(sibaResponse).toBeDefined();
  expect(sibaResponse.isSuccess).toBeFalsy();
  expect(sibaResponse.code).toBe("60");
  expect(sibaResponse.errorLine).toBe("0");
  expect(sibaResponse.errorMessage).toBe(
    "Não foi possível autenticar a Unidade Hoteleira"
  );
});

test("should receive success from DEV endpoint", async () => {
  const body = buildSIBARequestXML(bulletin);

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

  const sibaREsponse = parseSIBAXMLResponse(xmlResponse);
  expect(sibaREsponse.isSuccess).toBeTruthy();
}, 30000);
