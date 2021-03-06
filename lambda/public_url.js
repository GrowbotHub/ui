const axios = require("axios");


const rootUrl = 'https://api.remot3.it/apv/v27'
const developerkey = process.env.REMOTEIT_DEVELOPER_KEY;
const username = process.env.REMOTEIT_USERNAME;
const password = process.env.REMOTEIT_PASSWORD;
const deviceaddress = process.env.REMOTEIT_DEVICEADDRESS;
const wait = 'true';


exports.handler = async (event) => {    
    let token;
    let response;
    let hostip = event.headers['x-forwarded-for'];

    response = await axios.post(
        `${rootUrl}/user/login`,
        { username, password },
        { headers: { developerkey } }
    );
    token = response.data.token;

    response = await axios
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
        );

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
