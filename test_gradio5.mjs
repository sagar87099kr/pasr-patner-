import { client, handle_file } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Fetching images...");
        const garmentRes = await fetch("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/garment/00055_00.jpg");
        const garmentBlob = await garmentRes.blob();

        const modelRes = await fetch("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/person/00055_00.jpg");
        const modelBlob = await modelRes.blob();

        console.log("Connecting to IDM-VTON...");
        const app = await client("yisol/IDM-VTON");
        
        console.log("Calling /tryon endpoint...");
        const result = await app.predict("/tryon", [
            {"background": modelBlob, "layers": [], "composite": null}, 
            garmentBlob,
            "Professional studio photography",
            true,   // is_checked (use auto-masking)
            false,  // is_checked_crop (use auto-crop) - let's set to FALSE to see if it fixes it
            30,
            42
        ]);
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
