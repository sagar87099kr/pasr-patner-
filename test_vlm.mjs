import { client, handle_file } from "@gradio/client";

async function testGradio() {
    try {
        console.log("Connecting to Qwen/Qwen3-VL-Demo...");
        const app = await client("Qwen/Qwen3-VL-Demo");
        const info = await app.view_api();
        console.log(JSON.stringify(info, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
