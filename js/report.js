
var data = null;

async function getReport(month, year) {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
            action: "get",
            month: month,
            year: year,
        }),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
}

document.getElementById("submit").addEventListener("click", async () => {
    try {
        const my = document.getElementById("month").value;
        if (!my) {
            showMessage("กรุณาเลือกเดือน", "warning");
            return;
        }
        loader(true);
        var [year, month] = my.split("-");
        month = month.startsWith("0") ? month.replace("0", "") : month;
        const res = await getReport(month, year);
        if (!res.status) {
            showMessage(res.message, "warning");
            return;
        } else {
            data = res.data;
            document.getElementById("card-table").classList.remove("hidden");
            document.getElementById("card-search").classList.add("hidden");
            const columns = [
                { data: "EMPNO", title: "รหัสพนักงาน", className: "text-center" },
                { data: "NAME", title: "ชื่อ-สกุล" },
                {
                    data: "USEDATE",
                    title: "วันที่ใช้",
                    render: function (data) {
                        const date = new Date(data);
                        return date.toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        });
                    },
                },
            ];
            $("#table").DataTable({
                destroy: true,
                data: res.data,
                columns: columns,
                paging: true,
                language: {
                    info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                    infoEmpty: "",
                    search: "",
                    searchPlaceholder: "ค้นหา",
                    loadingRecords: "กำลังโหลดข้อมูล...",
                    emptyTable: "ไม่มีข้อมูลในตาราง",
                    zeroRecords: "ไม่พบข้อมูลที่ต้องการ",
                    lengthMenu: "_MENU_",
                    infoFiltered: "(กรองข้อมูลจากทั้งหมด _MAX_ รายการ)",
                },
            });
        }
    } catch (error) {
        showMessage("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        loader(false);
    }
});

document.getElementById("back").addEventListener("click", () => {
    document.getElementById("card-table").classList.add("hidden");
    document.getElementById("card-search").classList.remove("hidden");
});

document.getElementById("export").addEventListener("click", async () => {
    const fileName = `รายงานการใช้สิทธิ์วันเกิดพนักงาน_${document.getElementById("month").value}.xlsx`;
    const wk = await defaultExcel({
        data: data,
        column: [
            { header: "รหัสพนักงาน", key: "EMPNO", width: 15 },
            { header: "ชื่อ-สกุล", key: "NAME", width: 30 },
            { header: "วันที่ใช้", key: "USEDATE", width: 15, type: "date", numFmt: "dd/mm/yyyy" },
        ]
    });
    exportExcel(wk, fileName);
    // const my = document.getElementById("month").value;
    // var [year, month] = my.split("-");
    // month = month.startsWith("0") ? month.replace("0", "") : month;
    // const url = `${GOOGLE_SCRIPT_URL}?action=export&month=${month}&year=${year}`;
    // window.open(url, "_blank");
});