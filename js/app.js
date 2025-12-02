const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKsd5Iy8GbKqYDZ3MFfh1rFkJOgutVpIr8we1dARuka7i1cDYBuaSU4Q3pSqIlszhAOA/exec";
const LIFF_ID = "2008595384-42wB37LX";
const loadSwal = Swal.mixin({
    didOpen: () => {
        loadSwal.showLoading();
    },
    allowOutsideClick: false,
});


function showMessage(message, type = "error") {
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
