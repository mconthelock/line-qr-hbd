function exportExcel(workbook, fileName = "Report") {
    if (fileName.endsWith(".xlsx")) {
        fileName = fileName.slice(0, -5);
    }
    // สร้างไฟล์ Excel เป็น Blob
    workbook.xlsx.writeBuffer().then(function (buffer) {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // สร้างลิงก์ดาวน์โหลด
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`;
        link.click();
    });
}

async function defaultExcel({
        data = [],
        column = [], 
        sheetName = "Sheet1",
        font = { bold: true }, // ทำให้ตัวหนา
        alignment = { vertical: "middle", horizontal: "center" }, // จัดข้อความให้อยู่ตรงกลาง
        extraWidth = 8,
        manual = false,
        manualActions = (sheet) => {},
        autoWidth = true,
    } = {}) {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName); // เพื่มชีท และตั้งชื่อชีท

    // ตั้งชื่อ column และ key เพื่อให้สอดคล้องกับข้อมูล
    sheet.columns = column.map((col) => {
        const formatted = { ...col };
        if (col.type === "date")
            formatted.style = { numFmt: col.numFmt || "yyyy-mm-dd" };
        if (col.type === "number")
            formatted.style = { numFmt: col.numFmt || "0" };
        return formatted;
    });

    const typedRows = data.map((row) => {
        const o = {};
        for (const col of column) {
            const val = row[col.key];
            if (col.type === "date") {
                o[col.key] = toExcelDate(val, col.numFmt || ""); // 🔥 จุดเดียวจบ
            } else if (col.type === "number") {
                if (val === "" || val == null) o[col.key] = null;
                else {
                    const n = Number(val);
                    o[col.key] = isNaN(n) ? null : n;
                }
            } else {
                o[col.key] = val ?? null;
            }
        }
        return o;
    });

    // เพิ่มข้อมูลใน Sheet
    sheet.addRows(typedRows);

    const headerRow = sheet.getRow(1);
    headerRow.font = font;
    headerRow.alignment = alignment;
    // ตรวจสอบว่ามีฟังก์ชัน manualActions หรือไม่
    if (manual) {
        manualActions(sheet); // ส่ง sheet เพื่อให้ปรับแต่งตามที่กำหนด
    }

    // prettier-ignore
    if (autoWidth) {
        // คำนวณความยาวของข้อมูลในแต่ละคอลัมน์ และปรับความกว้าง
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                if (cell.isMerged && cell.address !== cell.master.address) return;
                const columnLength = cell.value ? cell.value.length : 10; // คำนวณความยาวของข้อมูลในเซลล์
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            console.log(maxLength);
            // จำกัดความกว้างไม่ให้เกินค่าใดค่าหนึ่ง (กันพัง)
            if (maxLength > 40) maxLength = 40;
            
            column.width = maxLength + extraWidth; // เพิ่มความกว้างอีกเล็กน้อยเพื่อไม่ให้ข้อมูลชนขอบ
        });
    }
    return workbook;
}