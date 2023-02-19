// const { ethers } = require("ethers") // not working out of nodejs
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi } from "./constants.js"
import { fundMeAddress as contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const showBalanceButton = document.getElementById("showBalanceButton")
const withdrawButton = document.getElementById("withdrawButton")
fundButton.onclick = fund
connectButton.onclick = connect
showBalanceButton.onclick = showBalance
withdrawButton.onclick = withdraw

console.log("ethers", ethers)
// set up the const values outside the functions in advance
const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
const signedAddress = await signer.getAddress()
const contract = new ethers.Contract(contractAddress, abi, signer)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log(`ethereum wallet is existing!`)
        window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connectted"
    } else {
        connectButton.innerHTML = "install wallet first to get connected"
    }
}

// fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding the contract with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        console.log(contract)
        console.log(provider)
        console.log(contract)
        // signer / wallet / someone with gas
        // ^ ABI and Address
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log(`Done!`) // this line will be run before the listenForTransactionMine function. Because the listening function is kick off but the program won't wait for it.
        } catch (e) {
            console.log(e)
        }
    }
}

// this is not async function
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
        // return new Promise()
    })
}

// show balance function
async function showBalance() {
    console.log(`showing balance now... `)
    if (typeof window.ethereum !== "undefined") {
        try {
            let balance = await provider.getBalance(contractAddress)
            let count = await provider.getTransactionCount(contractAddress)
            console.log(`contract count: ${count}`)
            console.log(`signer address:  ${signedAddress}`)
            count = await provider.getTransactionCount(signedAddress)
            console.log(`signer count: ${count}`)

            const contractBalance = ethers.utils.formatEther(balance)
            console.log(`the contract balance is: ${contractBalance}`)
            let balanceP = document.getElementById("contractBalance")
            balanceP.innerHTML = ethers.utils.formatEther(balance.toString())
        } catch (e) {
            console.log(e)
        }
    }
}

// withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        try {
            console.log(`withdrawing...`)
            const transactionResponse = await contract.cheapWithdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (e) {
            console.log(e)
        }
    }
}
