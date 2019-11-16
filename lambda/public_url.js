const axios = require("axios");


const rootUrl = 'https://api.remot3.it/apv/v27'
const developerkey = process.env.REMOTEIT_DEVELOPER_KEY;
const username = process.env.REMOTEIT_USERNAME;
const password = process.env.REMOTEIT_PASSWORD;
const deviceaddress = process.env.REMOTEIT_DEVICEADDRESS;
const wait = 'true';
const hostip = '1.1.1.1';


exports.handler = async (event) => {
    let token;

    const response = await axios.post(
        `${rootUrl}/user/login`,
        { username, password },
        { headers: { developerkey } }
    )

    const response = await axios
        .post(
            `${rootUrl}/device/connect`,
            {
                deviceaddress,
                wait,
                hostip
            },
            {
                headers: {
                    developerkey,
                    token
                }
            }
        )
    return {
        statusCode: 200,
        body: JSON.stringify(response.data),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    }
}

// exports.handler().then(res => { console.log(res) });