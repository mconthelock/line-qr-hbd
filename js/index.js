let html5QrCode = null;
let scanned = false;

$(async function(){
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }
    startScanner();
    // check("CEE3162A27E516AEA7FDE212B5DA1460");
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
    scanned = false;
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 60, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
}

function onScanSuccess(decodedText) {
    // If we've already handled a scan, ignore further callbacks
    if (scanned) return;
    scanned = true;

    const [uuid, empno] = decodedText.split("|");
    // Stop this instance (not the class) and then clear the UI
    if (html5QrCode) {
        html5QrCode
            .stop()
            .then(async () => {
                // clear UI elements inserted by the library
                html5QrCode.clear();

                document.getElementById("reader").style.display = "none";
                // Now you can call checkUUID or other handling once
                await checkUUID(uuid);
            })
            .catch((err) => {
                console.error("Error stopping scanner:", err);
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

async function checkUUID(uuid) {
    try {
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
        document.getElementById("loading").style.display = "none";
        document.getElementById(
            "result"
        ).innerHTML = `<span class="error">❌ เชื่อมต่อไม่ได้ (ตรวจสอบ URL Script)</span>`;
    }
}

function receiveData(res) {
    document.getElementById("loading").style.display = "none";
    const resultDiv = document.getElementById("result");
    if (res.status == "OK") {
        let str = `<h1>บันทึกข้อมูลสำเร็จ</h1>`;
        str += `<p>ชื่อ: ${res.data.empname}</p>`;
        str += `<p>${res.data.empno}</p>`;
        resultDiv.innerHTML = str;
    } else if (res.status == "USED") {
        resultDiv.innerHTML = `<h1>ถูกใช้ไปแล้ว</h1>`;
    } else if (res.status == "NOT_FOUND") {
        resultDiv.innerHTML = `<h1>ไม่พบข้อมูล</h1>`;
    } else {
        resultDiv.innerHTML = `<h1>เกิดข้อผิดพลาด</h1>`;
    }
    return;
}

function sendMessageToLine(msg) {
    if (liff.isInClient()) {
        liff.sendMessages([{ type: "text", text: msg }]).then(() =>
            setTimeout(() => liff.closeWindow(), 2000)
        );
    }
}
