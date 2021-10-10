const core = require('@actions/core');
const axios = require('axios')
const fs = require('fs')

async function requestBearer() {
    let response = await axios.get(
        process.env.ACTIONS_ID_TOKEN_REQUEST_URL, {
        headers: {
            Authorization: `bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`
        },
    }
    )
    fs.writeFileSync(process.env.AWS_WEB_IDENTITY_TOKEN_FILE, response.data['value'])
}

(async () => {
    try {
        const role_arn = core.getInput('role_arn');
        process.env.AWS_WEB_IDENTITY_TOKEN_FILE = `${process.env.RUNNER_TEMP}/awscreds`
        process.env.AWS_DEFAULT_REGION = 'us-east-1'
        process.env.AWS_ROLE_ARN = role_arn
        await requestBearer()

        fs.appendFileSync(process.env.GITHUB_ENV, `AWS_WEB_IDENTITY_TOKEN_FILE=${process.env.AWS_WEB_IDENTITY_TOKEN_FILE}` + "\n");
        fs.appendFileSync(process.env.GITHUB_ENV, `AWS_DEFAULT_REGION=us-east-1` + "\n" );
        fs.appendFileSync(process.env.GITHUB_ENV, `AWS_ROLE_ARN=${process.env.AWS_ROLE_ARN}` + "\n");
    } catch (error) {
        core.setFailed(error.message);
    }
})();
