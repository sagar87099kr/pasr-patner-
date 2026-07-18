import { client } from "@gradio/client";

async function testGradio() {
    try {
        const app = await client("yisol/IDM-VTON");
        const info = await app.view_api();
        console.log(JSON.stringify(info, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testGradio();
