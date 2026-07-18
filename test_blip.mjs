async function testBlip() {
    try {
        console.log("Fetching image...");
        const imageRes = await fetch("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/garment/00055_00.jpg");
        const imageBlob = await imageRes.blob();
        
        console.log("Calling BLIP...");
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
            {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                method: "POST",
                body: imageBlob,
            }
        );
        const result = await response.json();
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

testBlip();
