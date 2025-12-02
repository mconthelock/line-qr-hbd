

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
        const data = await getReport(month, year);
        console.log(data, data.status);

        if (!data.status) {
            showMessage(data.message, "warning");
            return;
        } else {
            const columns = [
                { data: "EMPNO", title: "รหัสพนักงาน" },
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
                data: data.data,
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