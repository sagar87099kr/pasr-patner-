import { client } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Connecting to merve/llava-interleave...");
        const app = await client("merve/llava-interleave");
        const info = await app.view_api();
        console.log(JSON.stringify(info, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
