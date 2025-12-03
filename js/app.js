const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKsd5Iy8GbKqYDZ3MFfh1rFkJOgutVpIr8we1dARuka7i1cDYBuaSU4Q3pSqIlszhAOA/exec";

const loadSwal = Swal.mixin({
    didOpen: () => {
        loadSwal.showLoading();
    },
    allowOutsideClick: false,
});


function showMessage(message, type = "error", option = {}) {
    Swal.fire({
        position: "bottom-end",
        title:
            type == "error"
                ? "Error"
                : type == "success"
                ? "Success"
                : "Warning!",
        text: message,
        icon: type,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        ...option
    });
}

function loader(show) {
    if (show) {
        loadSwal.fire({
            title: "กำลังโหลดข้อมูล...",
            customClass: {
                popup: "swal-loader-popup",
            },
            showConfirmButton: false,
            allowOutsideClick: false,
        });
    } else {
        const loaderEl = document.querySelector(".swal-loader-popup");
        if (loaderEl) {
            loadSwal.close(); // ปิดเฉพาะ instance ของ mixin (ถ้าเจอ)
        } else {
            // ไม่มี loader อยู่ แปลว่า toast หรือ popup อื่นมาก่อน — ไม่ทำไร
        }
    }
}

async   function sysSendMessageToLine(to, msg) {
    const payload = {
        to: to,
        messages: [
            {
                type: 'text',
                text: msg
            }
        ]
    };
    await fetch('https://api.line.me/v2/bot/message/push', { 
        method: 'POST', 
        headers: { 
            'Authorization': 'Bearer c9vBkfenIhx43rdyJGgG8ZNEE8v8gGiZO2jKib7L2lcHFcnT4G7ebMDlsSxyBJvAWHWbnLDR73MG7C76+1QW0IjPVsqwn2O+3nHY8wlNwq+asb+lOeodtS2biXWATE6fp7hU1UqN2Pr80LWjYedUFAdB04t89/1O/w1cDnyilFU=', 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload) 
    });
}
