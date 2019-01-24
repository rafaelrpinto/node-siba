"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmlJs = require("xml-js");
/**
 * Encodes the bulleting data.
 * @param bulletin The accommodation bulletin.
 */
function getEncodedBulletins(bulletin) {
    const { hotelUnit, guest } = bulletin;
    const { document } = guest;
    const request = {
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
            Boletim_Alojamento: {
                Apelido: guest.firstName,
                Nome: guest.surname,
                Nacionalidade: guest.nationality,
                Data_Nascimento: guest.birthDate.toISOString(),
                Local_Nascimento: guest.birthPlace,
                Documento_Identificacao: document.number,
                Pais_Emissor_Documento: document.issuingCountry,
                Tipo_Documento: document.type,
                Data_Entrada: guest.checkInDate.toISOString(),
                Data_Saida: guest.checkOutDate
                    ? guest.checkOutDate.toISOString()
                    : undefined,
                Pais_Residencia_Origem: guest.countryOfResidence,
                Local_Residencia_Origem: guest.placeOfResidence
            },
            Envio: {
                Numero_Ficheiro: bulletin.number,
                Data_Movimento: bulletin.issueDate.toISOString()
            }
        }
    };
    const bulletinsXML = xmlJs.js2xml(request, {
        compact: true
    });
    return Buffer.from(bulletinsXML).toString("base64");
}
exports.getEncodedBulletins = getEncodedBulletins;
/**
 * Generates the SOAP envelope with the bulletin request.
 * @param bulletin The accommodation bulletin.
 */
function getSoapEnvelope(bulletin) {
    const { hotelUnit } = bulletin;
    const envelope = {
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
                    Boletins: getEncodedBulletins(bulletin)
                }
            }
        }
    };
    return xmlJs.js2xml(envelope, {
        compact: true
    });
}
exports.getSoapEnvelope = getSoapEnvelope;
//# sourceMappingURL=serializer.js.map