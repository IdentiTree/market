// import {serverStatus} from "wallet"

const wallet = require('./wallet')
const identity = require('./identity')
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const cron = require('node-cron');
const { VerifiableCredential, Document, checkCredential } = require('@iota/identity-wasm/node')

const { CLIENT_CONFIG } = require('./iota_config')


const address = "19ew6Q7Bcb6VXJK2Bdi1iwa48Dn7jqDKW1oK5Pxiukoj3"

var serveIndex = require('serve-index')

app.use('/nfts', express.static('nfts'), serveIndex('nfts', { 'icons': true }))
app.use('/certs', express.static('certs'), serveIndex('certs', { 'icons': true }))


app.get('/status', (req, res) => {

    console.log("wallet", wallet)

    wallet.serverStatus().then((status) => {
        res.send(status)
    })
})

app.get('/create', (req, res) => {
    console.log("create get")
    res.sendfile(__dirname + '/create.html');
});

app.get('/create_cert', (req, res) => {
    console.log("create_cert get")
    res.sendfile(__dirname + '/create_cert.html');
});


app.get('/info', (req, res) => {

    let object = {
        absorptionRatePerDay: 0.5,
        title: "Fichtenwald am Fischweiher",
        sizeInSqm: 2300,
        owner: "did:iota:xyz",
        area: [
            [49.31323852284926, 7.371573914351571],
            [49.31327328404692, 7.372395622526794],
            [49.31289059169224, 7.372374392054574],
            [49.312997633327626, 7.371549470592754],
        ],
        did: agent.doc

    }
    res.send(object)
})

let agent;

app.get('/', (req, res) => {
    let html = `
        <h1>IdentiTree Land</h1>
        <a href="/nfts">NFT List</a> |
        <a href="/create">Create NFT</a>
        <br />
        <a href="/certs">Certificate List</a> |
        <a href="/create_cert">Create Certificate</a>
        <p>To buy a C02 Certificate, send 1000 IOTA to this address:</p>
        <pre>${address}</pre>
    `
    res.send(html)
})

app.post('/create_certificate', async (req, res) => {
    console.log('Got body:', req.body);
    let tree_did = req.body.did
    let revieve_address = req.body.address
    let response;
    if (tree_did) {
        // Prepare a credential subject indicating the degree earned by Alice
        let credentialSubject = {
            id: tree_did,
            name: "Trusted Tree CO2 Certificate Crendential",
        }

        try {
            console.log("1")
            // Create an unsigned `UniversityDegree` credential for Alice
            const unsignedVc = VerifiableCredential.extend({
                id: "http://example.edu/credentials/3732",
                type: "CO2Credential",
                issuer: agent.doc.id,
                credentialSubject,
                co2_credits: {
                    amount: 1000
                }
            });

            console.log("unsignedVc: ", unsignedVc)

            let doc = Document.fromJSON(agent.doc)
            console.log("doc: ", doc)
            // Sign the credential with the Issuer's newKey
            const signedVc = doc.signCredential(unsignedVc, {
                method: doc.id.toString() + "#key",
                public: agent.key.public,
                secret: agent.key.secret,
            });
            console.log("signedVc: ", signedVc)

            // Check if the credential is verifiable.
            let cv_res = await checkCredential(signedVc.toString(), CLIENT_CONFIG);

            let nft_res = await wallet.mintNftCert(signedVc)

            console.log("nft_res: ", nft_res)

            var searchstring = "Created NFT with ID:  "

            var start_string = nft_res.indexOf(searchstring) + searchstring.length;
            var end_string = start_string + 44
            var nft_id = nft_res.substring(start_string, end_string);
            console.log("start_string: ", start_string)
            console.log("nft_id: ", nft_id)
            console.log("nft_id: ", nft_id.length)


            response = {
                cv_res,
                nft_id
            }

            setTimeout(() => {
                wallet.sendNft(nft_id, revieve_address).then((data) => {
                    console.log("send nft!", data)
                });

            }, 10000)


            console.log("Verifiable Credential: ", response)
        } catch (error) {
            console.log("error: ", error)
        }

    } else {
        response = {
            error: "No DID given in the body"
        }
    }

    res.send(response)
})

app.post('/create_nft', async (req, res) => {
    console.log('Got body:', req.body);
    let image_link = req.body.image_link
    let response;
    if (image_link) {
        // Prepare a credential subject indicating the degree earned by Alice

        response = await wallet.mintNft(image_link)

        console.log("NFT created: ", response)
    } else {
        response = {
            error: "No image_link given in the body"
        }
    }

    res.send(response)
})



const main = async function () {

    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('db.json')
    const db = low(adapter)
    // Set some defaults (required if your JSON file is empty)
    db.defaults({ agent: {} })
        .write()

    agent = db.get('agent')
        .value()
    // check agent
    if (Object.keys(agent).length === 0 && agent.constructor === Object) {
        console.log("agent not found...")
        console.log("creating new agent")
        identity.createIdentity().then((id) => {
            agent = id
            db.set('agent', agent)
                .write()
            console.log("agent created!")
        });
    } else {
        console.log("agent found")
        // create agent
        console.log("agent: ", agent)
    }

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)

    })

}

main()