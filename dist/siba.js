"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_js_1 = require("xml-js");
/**
 * Looks for the value of a field of the object ignoring XML prefixes.
 * @param obj Response object or nested object
 * @param fieldName Target field name
 */
function getFieldValue(obj, fieldName) {
    const objKey = Object.keys(obj).find(key => key.indexOf(fieldName) !== -1);
    if (!objKey) {
        throw new Error(`Unable to find '${fieldName}' field on the response`);
    }
    return obj[objKey];
}
/**
 * Builds the bulletins structure.
 * @param bulletin The accommodation bulletin.
 */
function buildSIBABulletins(bulletin) {
    const { hotelUnit, guests } = bulletin;
    return {
        _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
        MovimentoBAL: {
            _attributes: {
                xmlns: "http://sef.pt/BAws"
            },
            Unidade_Hoteleira: {
                Codigo_Unidade_Hoteleira: hotelUnit.nipc,
                Estabelecimento: hotelUnit.establishment,
                Nome: hotelUnit.name,
                Abreviatura: hotelUnit.abbreviation,
                Morada: hotelUnit.address,
                Localidade: hotelUnit.location,
                Codigo_Postal: hotelUnit.zipCode,
                Zona_Postal: hotelUnit.zipZone,
                Telefone: hotelUnit.phone,
                Fax: hotelUnit.fax,
                Nome_Contacto: hotelUnit.contactName,
                Email_Contacto: hotelUnit.contactEmail
            },
            Boletim_Alojamento: guests.map(guest => ({
                Apelido: guest.surname ? guest.surname : guest.firstName,
                Nome: guest.surname ? guest.firstName : " ",
                Nacionalidade: guest.nationality,
                Data_Nascimento: guest.birthDate && guest.birthDate.toISOString(),
                Local_Nascimento: guest.birthPlace,
                Documento_Identificacao: guest.document.number,
                Pais_Emissor_Documento: guest.document.issuingCountry,
                Tipo_Documento: guest.document.type,
                Data_Entrada: guest.checkInDate && guest.checkInDate.toISOString(),
                Data_Saida: guest.checkOutDate && guest.checkOutDate.toISOString(),
                Pais_Residencia_Origem: guest.countryOfResidence,
                Local_Residencia_Origem: guest.placeOfResidence
            })),
            Envio: {
                Numero_Ficheiro: bulletin.number,
                Data_Movimento: bulletin.issueDate && bulletin.issueDate.toISOString()
            }
        }
    };
}
exports.buildSIBABulletins = buildSIBABulletins;
/**
 * Generates the SOAP envelope with the bulletin request.
 * @param bulletin The accommodation bulletin.
 */
function buildSIBASoapEnvelope(bulletin) {
    const { hotelUnit } = bulletin;
    const bulletinXML = xml_js_1.js2xml(buildSIBABulletins(bulletin), {
        compact: true
    });
    return {
        Envelope: {
            _attributes: {
                xmlns: "http://www.w3.org/2003/05/soap-envelope"
            },
            Header: {},
            Body: {
                EntregaBoletinsAlojamento: {
                    _attributes: {
                        xmlns: "http://sef.pt/"
                    },
                    UnidadeHoteleira: hotelUnit.nipc,
                    Estabelecimento: hotelUnit.establishment,
                    ChaveAcesso: hotelUnit.accessKey,
                    Boletins: Buffer.from(bulletinXML).toString("base64")
                }
            }
        }
    };
}
exports.buildSIBASoapEnvelope = buildSIBASoapEnvelope;
/**
 * Generates the XML SOAP envelope with the bulletin request.
 * @param bulletin The accommodation bulletin.
 */
function buildSIBAXMLRequest(bulletin) {
    // basic validation just to make sure anything breaks
    if (!bulletin ||
        !bulletin.guests ||
        !bulletin.guests.length ||
        !bulletin.hotelUnit) {
        throw new Error("Incomplete bulletin.");
    }
    return xml_js_1.js2xml(buildSIBASoapEnvelope(bulletin), {
        compact: true
    });
}
exports.buildSIBAXMLRequest = buildSIBAXMLRequest;
/**
 * Parses the SIBA SOAP response.
 * @param responseText Raw response text
 */
function parseSIBAXMLResponse(responseText) {
    const soapResponse = xml_js_1.xml2js(responseText, {
        compact: true,
        textKey: "value"
    });
    // looks for the envelope fields despite the xml prefix
    const envelope = getFieldValue(soapResponse, "Envelope");
    const body = getFieldValue(envelope, "Body");
    const response = getFieldValue(body, "EntregaBoletinsAlojamentoResponse");
    const result = getFieldValue(response, "EntregaBoletinsAlojamentoResult");
    if (result.value === "0") {
        return {
            isSuccess: true,
            code: "0"
        };
    }
    const details = xml_js_1.xml2js(result.value, {
        compact: true,
        textKey: "value"
    });
    const errors = getFieldValue(details, "ErrosBA");
    const returns = getFieldValue(errors, "RetornoBA");
    return {
        isSuccess: false,
        code: returns["Codigo_Retorno"] && returns["Codigo_Retorno"].value,
        errorLine: returns["Linha"] && returns["Linha"].value,
        errorMessage: returns["Descricao"] && returns["Descricao"].value
    };
}
exports.parseSIBAXMLResponse = parseSIBAXMLResponse;
//# sourceMappingURL=siba.js.map