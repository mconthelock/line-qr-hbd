var cameraStart = null;
var scanned = false;
var userId = "";
var displayName = "";
const LIFF_ID = "2008595384-42wB37LX";
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
        // document.querySelector("#result").innerHTML = `UUID: ${result.value}`;
    } catch (error) {
        console.log("scanCodeV2", error);
    }
}

function startScanner() {
    document.getElementById("reader").style.display = "block";
    document.getElementById("scan").style.display = "none";
    document.getElementById("result").style.display = "none";
    scanned = false;
    cameraStart = new Html5Qrcode("reader");
    const config = { fps: 60, qrbox: { width: 250, height: 250 } };
    cameraStart.start({ facingMode: "environment" }, config, onScanSuccess);
}

function onScanSuccess(decodedText) {
    // If we've already handled a scan, ignore further callbacks
    if (scanned) return;
    scanned = true;

    // Stop this instance (not the class) and then clear the UI
    if (cameraStart) {
        cameraStart
            .stop()
            .then(async () => {
                // clear UI elements inserted by the library
                cameraStart.clear();
                loader(true);

                document.getElementById("reader").style.display = "none";
                document.getElementById("scan").style.display = "inline-block";
                // Now you can call checkUUID or other handling once
                const check = await checkUUID(decodedText);
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
async function checkUUID(qr) {
    try {
        const [uuid, empno, expire] = qr.split("|");
        if(new Date().getMonth() + 1 != Number(expire)) {
            return {status: "EXPIRED"};
        }
        const profile = await liff.getProfile();
        // showMessage(`ยินดีต้อนรับ ${profile.displayName} ${profile.userId} `, "success");
        userId = profile.userId;
        displayName = profile.displayName;
        // document.getElementById('result').innerHTML = `UUID: ${uuid}`;
        const res = await fetch(
            `${GOOGLE_SCRIPT_URL}?uuid=${encodeURIComponent(uuid)}&callback=receiveData&userId=${encodeURIComponent(userId)}&displayname=${encodeURIComponent(displayName)}`,
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

//prettier-ignore
function receiveData(res) {
    const resultDiv = document.getElementById("result");
    document.getElementById("result").style.display = "block";
    if (res.status == "OK") {
        let str = `<h1>บันทึกข้อมูลสำเร็จ</h1>`;
        str += `<p>ชื่อ: ${res.data.empname}</p>`;
        str += `<p>${res.data.empno}</p>`;
        resultDiv.innerHTML = str;
        // showMessage(`บันทึกข้อมูลสำเร็จ ชื่อ: ${res.data.empname} (${res.data.empno})`,"success",{ timer: false, showCloseButton: true, timerProgressBar: false, toast: false});
    } else if (res.status == "USED") {
        resultDiv.innerHTML = `<h1>❌ ถูกใช้ไปแล้ว</h1>
        <p>ชื่อ: ${res.data.empname}</p>
        <p>${res.data.empno}</p>`;
        // showMessage(`รหัสนี้ถูกใช้ไปแล้ว ชื่อ: ${res.data.empname} (${res.data.empno})`,"warning",{ timer: false, showCloseButton: true, timerProgressBar: false, toast: false});
    } else if (res.status == "NOT_FOUND") {
        resultDiv.innerHTML = `<h1>ไม่พบข้อมูลพนักงาน</h1>`;
        // showMessage("ไม่พบข้อมูลพนักงาน", "warning",{ timer: false, showCloseButton: true, timerProgressBar: false, toast: false});
    } else if (res.status == "EXPIRED") {
        resultDiv.innerHTML = `<h1>❌ คูปองหมดอายุการใช้งาน</h1>`;
        // showMessage("รหัสนี้หมดอายุการใช้งาน", "warning",{ timer: false, showCloseButton: true, timerProgressBar: false, toast: false});
    } else {
        resultDiv.innerHTML = `<h1>เกิดข้อผิดพลาดในการบันทึกข้อมูล</h1>`;
        // showMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error", { timer: false, showCloseButton: true, timerProgressBar: false, toast: false});
    }
}

function sendMessageToLine(msg) {
    if (liff.isInClient()) {
        liff.sendMessages([{ type: "text", text: msg }]).then(() =>
            setTimeout(() => liff.closeWindow(), 2000)
        );
    }
}
