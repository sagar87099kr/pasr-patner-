import { client, handle_file } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Connecting to IDM-VTON...");
        const app = await client("yisol/IDM-VTON");
        
        console.log("Calling /tryon endpoint with handle_file...");
        const result = await app.predict("/tryon", [
            {
                "background": handle_file("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/person/00055_00.jpg"),
                "layers": [],
                "composite": null
            }, 
            handle_file("https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/garment/00055_00.jpg"),
            "Professional studio photography",
            true,
            true,
            30,
            42
        ]);
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
