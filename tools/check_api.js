import https from 'https';

const url = 'https://ankaverse.com.tr/wp-json/wp/v2/posts';

function check() {
    https.get(url, (res) => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);

        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Body start:', data.substring(0, 500));
            try {
                const json = JSON.parse(data);
                console.log('Is Array:', Array.isArray(json));
                console.log('Count:', json.length);
            } catch (e) {
                console.error('JSON Parse Error:', e.message);
            }
        });

    }).on('error', (e) => {
        console.error('Error:', e);
    });
}

check();