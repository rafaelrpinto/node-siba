"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require("node-fetch");
const xmlJs = require("xml-js");
const types_1 = require("./types");
const siba_1 = require("./siba");
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
    guests: [
        {
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
                type: types_1.GuestDocumentType.PASSPORT
            }
        },
        {
            firstName: "Mary",
            surname: "Anne",
            nationality: "AFG",
            birthDate: new Date("2009-01-01T10:00:00Z"),
            birthPlace: "A place",
            checkInDate: new Date("2019-01-01T10:00:00Z"),
            checkOutDate: new Date("2019-01-03T10:00:00Z"),
            countryOfResidence: "AFG",
            placeOfResidence: "A place",
            document: {
                number: "1234ABCD",
                issuingCountry: "AFG",
                type: types_1.GuestDocumentType.PASSPORT
            }
        }
    ]
};
test("should generate a valid SIBA envelope", () => {
    const { Envelope } = siba_1.buildSIBASoapEnvelope(bulletin);
    expect(Envelope).toBeDefined();
    expect(Envelope.Header).toBeDefined();
    expect(Envelope.Body).toBeDefined();
    const { EntregaBoletinsAlojamento } = Envelope.Body;
    expect(EntregaBoletinsAlojamento).toBeDefined();
    expect(EntregaBoletinsAlojamento.UnidadeHoteleira).toBe(bulletin.hotelUnit.nipc);
    expect(EntregaBoletinsAlojamento.Estabelecimento).toBe(bulletin.hotelUnit.establishment);
    expect(EntregaBoletinsAlojamento.ChaveAcesso).toBe(bulletin.hotelUnit.accessKey);
    const decodedBulletins = Buffer.from(EntregaBoletinsAlojamento.Boletins, "base64").toString("utf-8");
    const bulletins = xmlJs.xml2js(decodedBulletins, {
        compact: true,
        textKey: "value"
    });
    expect(bulletins).toBeDefined();
    // @ts-ignore
    const { MovimentoBAL } = bulletins;
    expect(MovimentoBAL).toBeDefined();
    const { Unidade_Hoteleira, Envio } = MovimentoBAL;
    expect(Unidade_Hoteleira.Abreviatura.value).toBe(bulletin.hotelUnit.abbreviation);
    expect(Unidade_Hoteleira.Codigo_Postal.value).toBe(bulletin.hotelUnit.zipCode);
    expect(Unidade_Hoteleira.Codigo_Unidade_Hoteleira.value).toBe(bulletin.hotelUnit.nipc);
    expect(Unidade_Hoteleira.Email_Contacto.value).toBe(bulletin.hotelUnit.contactEmail);
    expect(Unidade_Hoteleira.Estabelecimento.value).toBe(bulletin.hotelUnit.establishment);
    expect(Unidade_Hoteleira.Fax.value).toBe(bulletin.hotelUnit.fax);
    expect(Unidade_Hoteleira.Localidade.value).toBe(bulletin.hotelUnit.location);
    expect(Unidade_Hoteleira.Morada.value).toBe(bulletin.hotelUnit.address);
    expect(Unidade_Hoteleira.Nome.value).toBe(bulletin.hotelUnit.name);
    expect(Unidade_Hoteleira.Nome_Contacto.value).toBe(bulletin.hotelUnit.contactName);
    expect(Unidade_Hoteleira.Telefone.value).toBe(bulletin.hotelUnit.phone);
    expect(Unidade_Hoteleira.Zona_Postal.value).toBe(bulletin.hotelUnit.zipZone);
    expect(Number(Envio.Numero_Ficheiro.value)).toBe(bulletin.number);
    expect(Envio.Data_Movimento.value).toBe(bulletin.issueDate.toISOString());
    bulletin.guests.forEach((guest, i) => {
        const boletim = MovimentoBAL.Boletim_Alojamento[i];
        expect(boletim.Apelido.value).toBe(guest.firstName);
        expect(boletim.Data_Entrada.value).toBe(guest.checkInDate.toISOString());
        expect(boletim.Data_Nascimento.value).toBe(guest.birthDate.toISOString());
        expect(boletim.Data_Saida.value).toBe(guest.checkOutDate && guest.checkOutDate.toISOString());
        expect(boletim.Documento_Identificacao.value).toBe(guest.document.number);
        expect(boletim.Local_Nascimento.value).toBe(guest.birthPlace);
        expect(boletim.Local_Residencia_Origem.value).toBe(guest.placeOfResidence);
        expect(boletim.Nacionalidade.value).toBe(guest.nationality);
        expect(boletim.Nome.value).toBe(guest.surname);
        expect(boletim.Pais_Emissor_Documento.value).toBe(guest.document.issuingCountry);
        expect(boletim.Pais_Residencia_Origem.value).toBe(guest.countryOfResidence);
        expect(boletim.Tipo_Documento.value).toBe(guest.document.type);
    });
});
test("should parse SIBA success response correctly", () => {
    const successResponse = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        '<soap:Body><EntregaBoletinsAlojamentoResponse xmlns="http://sef.pt/">' +
        "<EntregaBoletinsAlojamentoResult>0</EntregaBoletinsAlojamentoResult>" +
        "</EntregaBoletinsAlojamentoResponse></soap:Body></soap:Envelope>";
    const sibaResponse = siba_1.parseSIBAXMLResponse(successResponse);
    expect(sibaResponse).toBeDefined();
    expect(sibaResponse.isSuccess).toBeTruthy();
    expect(sibaResponse.code).toBe("0");
    expect(sibaResponse.errorLine).toBeUndefined();
    expect(sibaResponse.errorMessage).toBeUndefined();
});
test("should parse SIBA error response correctly", () => {
    const successResponse = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><EntregaBoletinsAlojamentoResponse xmlns="http://sef.pt/"><EntregaBoletinsAlojamentoResult>&lt;ErrosBA xmlns="http://www.sef.pt/BAws"&gt;' +
        "&lt;RetornoBA&gt;" +
        "&lt;Linha&gt;0&lt;/Linha&gt;" +
        "&lt;Codigo_Retorno&gt;60&lt;/Codigo_Retorno&gt;" +
        "&lt;Descricao&gt;Não foi possível autenticar a Unidade Hoteleira&lt;/Descricao&gt;" +
        "&lt;/RetornoBA&gt;" +
        "&lt;/ErrosBA&gt;</EntregaBoletinsAlojamentoResult></EntregaBoletinsAlojamentoResponse></soap:Body></soap:Envelope>";
    const sibaResponse = siba_1.parseSIBAXMLResponse(successResponse);
    expect(sibaResponse).toBeDefined();
    expect(sibaResponse.isSuccess).toBeFalsy();
    expect(sibaResponse.code).toBe("60");
    expect(sibaResponse.errorLine).toBe("0");
    expect(sibaResponse.errorMessage).toBe("Não foi possível autenticar a Unidade Hoteleira");
});
test("should execute a basic validation on bulleting structure", () => {
    expect(() => {
        // @ts-ignore
        siba_1.buildSIBARequestXML({});
    }).toThrowError("Incomplete bulletin.");
});
test("should receive success from DEV endpoint", () => __awaiter(this, void 0, void 0, function* () {
    const body = siba_1.buildSIBARequestXML(bulletin);
    const response = yield fetch("https://siba.sef.pt/bawsdev/boletinsalojamento.asmx", {
        body,
        method: "post",
        headers: {
            "Content-Type": "text/xml",
            SOAPAction: "http://sef.pt/EntregaBoletinsAlojamento"
        }
    });
    const xmlResponse = yield response.text();
    const sibaREsponse = siba_1.parseSIBAXMLResponse(xmlResponse);
    expect(sibaREsponse.isSuccess).toBeTruthy();
}), 30000);
//# sourceMappingURL=siba.test.js.map