const formatField = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, "0")}${value}`;

export const JUVENTUDE_PIX_KEY = "juventudepibls@gmail.com";
export const JUVENTUDE_PIX_IMAGE = "/images/pix.png";

const sanitize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();

const crc16 = (value: string) => {
  let crc = 0xffff;

  for (let i = 0; i < value.length; i += 1) {
    crc ^= value.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
};

export const createPixPayload = ({
  pixKey,
  amount,
  merchantName,
  merchantCity,
  txid,
  description,
}: {
  pixKey: string;
  amount: number;
  merchantName: string;
  merchantCity: string;
  txid: string;
  description?: string;
}) => {
  const merchantInfo = [
    formatField("00", "BR.GOV.BCB.PIX"),
    formatField("01", pixKey),
    description ? formatField("02", description.slice(0, 50)) : "",
  ].join("");

  const payloadWithoutCrc = [
    formatField("00", "01"),
    formatField("26", merchantInfo),
    formatField("52", "0000"),
    formatField("53", "986"),
    formatField("54", amount.toFixed(2)),
    formatField("58", "BR"),
    formatField("59", sanitize(merchantName).slice(0, 25) || "SALT"),
    formatField("60", sanitize(merchantCity).slice(0, 15) || "LAGOA SANTA"),
    formatField("62", formatField("05", txid.slice(0, 25) || "***")),
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
};
