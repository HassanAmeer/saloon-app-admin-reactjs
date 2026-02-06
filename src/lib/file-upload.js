export const uploadChunkedBase64 = async (base64) => {
    const CHUNK_SIZE = 256 * 1024;
    const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
    const fileId = Date.now().toString();
    let finalResult = null;

    for (let i = 0; i < totalChunks; i++) {
        const chunk = base64.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        const response = await fetch('https://link.thelocalrent.com/api/upload_base64_chunks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 37160f2e00721d906831565829ae1de7'
            },
            body: JSON.stringify({
                folder_name: "salon-app",
                is_secret: true,
                file_id: fileId,
                chunk_index: i,
                total_chunks: totalChunks,
                chunk_data: chunk
            })
        });
        console.log(`Chunk ${i} Status:`, response.status);
        finalResult = await response.json();
        console.log(`Chunk ${i} Response:`, finalResult);
    }
    return finalResult;
};