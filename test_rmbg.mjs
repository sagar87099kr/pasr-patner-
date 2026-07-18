import { client, handle_file } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Connecting to briaai/BRIA-RMBG-2.0...");
        const app = await client("briaai/BRIA-RMBG-2.0");
        const info = await app.view_api();
        console.log(JSON.stringify(info, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
