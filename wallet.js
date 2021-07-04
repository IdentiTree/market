const { exec } = require("child_process");

var path = require('path');


const serverStatus = function (body) {
    let myPromise = new Promise(function (myResolve, myReject) {

        exec("./cli-wallet server-status", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            console.log(`stdout: ${stdout}`);
            myResolve(stdout);

        });

    });
    return myPromise
}

function sendAsset(color, address) {
    let myPromise = new Promise(function (myResolve, myReject) {
        console.log("send asset:", color, address)
        let command = `./cli-wallet send-funds -color ${color} -amount 1337 -dest-addr ${address}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            myResolve(stdout);
        });
    });
    return myPromise
}

function sendNft(id, address) {
    let myPromise = new Promise(function (myResolve, myReject) {
        console.log("nft asset:", id, address)
        let command = `./cli-wallet transfer-nft -id ${id} -dest-addr ${address}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            myResolve(stdout);
        });
    });
    return myPromise
}


function mintNft(img_link) {
    let myPromise = new Promise(function (myResolve, myReject) {
        console.log("create nft for image:", img_link)
        let nft_metadate = {
            "title": "Asset Metadata",
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "MyFirstNFT"
                },
                "description": {
                    "type": "string",
                    "description": "My very first NFT that has this metadata attached to it."
                },
                "image": {
                    "type": "string",
                    "description": img_link
                }
            }
        }
        var fs = require('fs');
        const callbackFunction = function(err, test) {
            console.log("err", err)
            console.log("test", test)
        }
        let image_path = "./nfts/" + Date.now() + ".json"
        fs.writeFile(image_path, JSON.stringify(nft_metadate), callbackFunction)

        let command = `./cli-wallet create-nft -immutable-data ${image_path}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            myResolve(stdout);
        });
    });
    return myPromise
}

function mintNftCert(vc) {
    let myPromise = new Promise(function (myResolve, myReject) {
        console.log("create nft for vc:", vc)
        let nft_metadate = {
            "title": "Asset Metadata",
            "type": "object",
            "properties": {
                "vc": vc
            }
        }
        var fs = require('fs');
        const callbackFunction = function(err, test) {
            console.log("err", err)
            console.log("test", test)
        }
        let image_path = "./certs/" + Date.now() + ".json"
        fs.writeFile(image_path, JSON.stringify(nft_metadate), callbackFunction)

        let command = `./cli-wallet create-nft -immutable-data ${image_path}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            myResolve(stdout);
        });
    });
    return myPromise
}


// create an asset in the form of colored coins
function mintAsset(name, symbol) {

    let myPromise = new Promise(function (myResolve, myReject) {
        let command = `src/plugins/nft/cli-wallet create-asset -amount 1 -name ${name}`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                myReject();
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                myReject();
            }
            console.log(`stdout: ${stdout}`);
            myResolve(stdout);
        });
    });

    return myPromise
}

module.exports = {

    serverStatus, sendAsset, mintNft, mintNftCert, sendNft
}
