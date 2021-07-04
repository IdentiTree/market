
const { Document, KeyType, publish } = require('@iota/identity-wasm/node')
const CLIENT_CONFIG = {
    network: "main",
    node: "https://chrysalis-nodes.iota.org:443",
}

const EXPLORER_URL = "https://explorer.iota.org/mainnet/transaction";

/*
    This example shows a basic introduction on how to create a basic DID Document and upload it to the Tangle.
    A ED25519 Keypair is generated, from which the public key is hashed, becoming the DID.
    The keypair becomes part of the DID Document in order to prove a link between the DID and the published DID Document.
    That same keypair should be used to sign the original DID Document.
*/
async function createIdentity() {
    //Create a DID Document (an identity).
    const { doc, key } = new Document(KeyType.Ed25519)

    //Sign the DID Document with the generated key
    doc.sign(key);

    //Publish the Identity to the IOTA Network, this may take a few seconds to complete Proof-of-Work.
    const messageId = await publish(doc.toJSON(), CLIENT_CONFIG);

    //Log the results
    console.log(`Identity Creation: ${EXPLORER_URL}/${messageId}`);

    //Return the results
    return { key, doc, messageId };
}


exports.createIdentity = createIdentity;
