dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_customParseFormat);

const DATE_FORMATS = [
  "D-MMM-YY", "D-MMM-YYYY",
  "DD-MMM-YY", "DD-MMM-YYYY",
  "D/MMM/YY", "D/MMM/YYYY",
  "YYYY-MM-DD", "YYYY/MM/DD",
  "DD/MM/YYYY", "D/M/YYYY",
];

function toExcelDate(input, numFmt = ''){
    
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "string") {
    const s = input.trim();
    // หา format ที่ตรงกับที่กำหนดไว้
    for (const fmt of DATE_FORMATS) {
      const d = dayjs.utc(s, fmt, "en", true); // true = strict
      if (d.isValid()) {
        // หากได้วันที่ที่ถูกต้อง
        // ถ้า format มีชั่วโมง นาที วินาที ให้ตั้งเป็น UTC แบบเต็ม ไม่งั้นจะเป็นแค่วันที่
        if(numFmt.toLowerCase().includes('h') || numFmt.toLowerCase().includes('m') || numFmt.toLowerCase().includes('s')){
            return new Date(Date.UTC(d.year(), d.month(), d.date(), d.hour(), d.minute(), d.second()));
        }else{
            return new Date(Date.UTC(d.year(), d.month(), d.date()));
        }
      }
    }
    // เผื่อ format แปลก ๆ ก็ให้โอกาส JS parse ปกติเป็น fallback
    const d2 = new Date(s);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}