import { generateNote } from './lib/claudeClient.js';
import fs from 'fs';

async function test() {
    try {
        console.log("Testing generation...");
        let result = await generateNote({
            mode: 'topic',
            input: 'Photosynthesis',
            style: 'Mindmap'
        });
        fs.writeFileSync('out_node.json', JSON.stringify(result, null, 2), 'utf8');
        console.log("Written to out_node.json");
    } catch(err) {
        console.error(err);
    }
}
test();
