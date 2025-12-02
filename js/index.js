let cameraStart = null;
let scanned = false;

$(async function () {
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }
    startScanner();
});

async function scanQRCode() {
    try {
        const result = await liff.scanCodeV2();
        document.querySelector("#result").innerHTML = `UUID: ${result.value}`;
    } catch (error) {
        console.log("scanCodeV2", error);
    }
}

function startScanner() {
    document.getElementById("reader").style.display = "block";
    scanned = false;
    cameraStart = new Html5Qrcode("reader");
    const config = { fps: 60, qrbox: { width: 250, height: 250 } };
    cameraStart.start({ facingMode: "environment" }, config, onScanSuccess);
}

function onScanSuccess(decodedText) {
    // If we've already handled a scan, ignore further callbacks
    if (scanned) return;
    scanned = true;

    const [uuid, empno] = decodedText.split("|");
    // Stop this instance (not the class) and then clear the UI
    if (cameraStart) {
        cameraStart
            .stop()
            .then(async () => {
                // clear UI elements inserted by the library
                cameraStart.clear();
                loader(true);

                document.getElementById("reader").style.display = "none";
                // Now you can call checkUUID or other handling once
                const check = await checkUUID(uuid);
                receiveData(check);
            })
            .catch((err) => {
                console.error("Error stopping scanner:", err);
            })
            .finally(() => {
                loader(false);
            });
    } else {
        // Fallback: hide reader and mark scanned
        document.getElementById("reader").style.display = "none";
    }
}

// function checkUUID(uuid) {
//     document.getElementById('loading').style.display = 'block';
//     document.getElementById('result').innerHTML = `UUID: ${uuid}`;
//     const script = document.createElement('script');
//     const callbackName = 'receiveData';
//     script.src = `${GOOGLE_SCRIPT_URL}?uuid=${encodeURIComponent(uuid)}&callback=${callbackName}`;
//     script.onerror = () => {
//         document.getElementById('loading').style.display = 'none';
//         document.getElementById('result').innerHTML = `<span class="error">❌ เชื่อมต่อไม่ได้ (ตรวจสอบ URL Script)</span>`;
//     };
//     document.body.appendChild(script);
// }

//prettier-ignore
async function checkUUID(uuid) {
    try {
        document.getElementById('result').innerHTML = `UUID: ${uuid}`;
        const res = await fetch(
            `${GOOGLE_SCRIPT_URL}?uuid=${encodeURIComponent(
                uuid
            )}&callback=receiveData`,
            {
                method: "GET",
            }
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    } catch (error) {
        showMessage("❌ เชื่อมต่อไม่ได้ (ตรวจสอบ URL Script)", "error", { timer: 5000 });
    }
}

function receiveData(res) {
    const resultDiv = document.getElementById("result");
    if (res.status == "OK") {
        showMessage(
            `บันทึกข้อมูลสำเร็จ ชื่อ: ${res.data.empname} (${res.data.empno})`,
            "success",
            { timer: false, showCloseButton: true, timerProgressBar: false }
        );
    } else if (res.status == "USED") {
        showMessage(
            `รหัสนี้ถูกใช้ไปแล้ว ชื่อ: ${res.data.empname} (${res.data.empno})`,
            "warning",
            { timer: false, showCloseButton: true, timerProgressBar: false }
        );
    } else if (res.status == "NOT_FOUND") {
        showMessage("ไม่พบข้อมูลพนักงาน", "warning", {
            timer: false,
            showCloseButton: true,
            timerProgressBar: false,
        });
    } else {
        showMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error", {
            timer: false,
            showCloseButton: true,
            timerProgressBar: false,
        });
    }
}

function sendMessageToLine(msg) {
    if (liff.isInClient()) {
        liff.sendMessages([{ type: "text", text: msg }]).then(() =>
            setTimeout(() => liff.closeWindow(), 2000)
        );
    }
}
