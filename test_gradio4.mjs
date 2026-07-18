import { client, handle_file } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Connecting to Kwai-Kolors/Kolors-Virtual-Try-On...");
        const app = await client("Kwai-Kolors/Kolors-Virtual-Try-On");
        
        console.log("Calling /tryon endpoint...");
        const result = await app.predict("/tryon", [
            handle_file("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/person/00055_00.jpg"),
            handle_file("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/garment/00055_00.jpg"),
            "Professional studio photography",
        ]);
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
