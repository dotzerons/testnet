import { useState } from "react";
import type { NextPage } from "next";
import { useWallet,CardanoWallet } from '@meshsdk/react';
import { BlockfrostProvider,applyParamsToScript,MeshTxBuilder, resolveScriptHash, stringToHex, builtinByteString, serializePlutusScript, deserializeAddress } from '@meshsdk/core';
import 'dotenv/config';

const delegatorscript="5905780101002229800aba2aba1aba0aab9faab9eaab9dab9a9bae0039bae00248888888896600264653001300a00198051805800cdc3a40009112cc004c004c024dd50014660026eb8c034c028dd50014c038c038c028dd51806802cdd2a4001370e90012444464646644b30013016002899192cc004c01cdd6980a00144cc88c966002601c602c6ea800626644b30013010301837540031323259800980f800c4c966002601e6eb4c070006264b300130210018992cc004c044dd6980f000c4c966002602c603c6ea8006264b30013370e9002180f9baa001899192cc004cdc79bae302100500f8acc004cdc79bae3021007488104646f7430008acc004c064cdc70012400115980099b870014804a2946266e1c0052052408115980099b88001483e81e33001370e902d4dc02400537009000cdc62400091111919191919800800a400044b30015980099b8700a0018a51899b87001483f80d0294528456600266e1ccdc7005800a4081159800cc004cc01800402e9000400500346600330013008001805402d718a4001300733702014002801a294102944cc008008c0200050292052300100122225980099b870010028992cc004cdc42400000715980099b89003481fa2b30019800acc004c028cdc7000a400114a31300a3371c0026010006815294294502a466002003480020068032294102a452820548a5040a86600c00400715980099b873371c006004902e44c96600266e2120000038acc004cdc4801a40fd159800cc00566002601466e3800520008a518980519b8e001300800340a94a14a281522b30019800800d2000801a00c8cc004017300130090038014011718a4001300833702004006802a294102a452820548a5040a914a08150cc01800800e33001004801cc02000a002802102920522223233001001003225980099b870030018a518992cc00566002b300133712906100800c4cdc4800a41e80314a0815229462b30015980099b8948180006266e2400520728a5040a914a31300a00140a88152266006006601200514a08150cdc7002800a05245282040408114a0810229410201b8d001375c604660406ea80062c80f0c088c08cc08cc07cdd51811180f9baa0018b203a3300900d2323300100132330010013756601a60426ea800c896600200314bd7044cc090c084c094004cc008008c098005023112cc00400629422b30013371e6eb8c09000405e2946266004004604a00280f902245901c1810000c5901e198069bab3008301c3754006025164068603c003164070660166eacc018c068dd5000a451cce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be800301c3019375400316405c6034602e6ea8004cc0080188cdd7980d980c1baa301b301837540026018660346ea40512f5c11640546600200a4601464b3001300b3017375400314800226eb4c06cc060dd5000a02c32598009805980b9baa0018a60103d87a8000899198008009bab301c3019375400444b30010018a6103d87a8000899192cc004cdc8804800c56600266e3c024006260206603c603800497ae08a60103d87a80004069133004004302000340686eb8c068004c07400501b202c3300937566006602e6ea80040508c060c06400488c8cc00400400c896600200314c0103d87a80008992cc004c0100062601a6603600297ae0899801801980e801202e301b00140651640486eb8c048004c05400a2c8098cc004dd59809980a180a0028031bac3013005223259800980298089baa0018a5eb7bdb18226eacc054c048dd5000a020330030020012232330010010032259800800c530103d87a8000899192cc004cdc8802800c56600266e3c014006260106602c602800497ae08a60103d87a80004049133004004301800340486eb8c048004c05400501322c80406014002600a6ea802a29344d95900301";
console.log(deserializeAddress("addr_test1wrqwaad985pkgs4l3qwwmu80d0djk3qfyv0mhf925ajq4qspkwtv7").scriptHash);
console.log(builtinByteString(deserializeAddress("addr_test1wrqwaad985pkgs4l3qwwmu80d0djk3qfyv0mhf925ajq4qspkwtv7").scriptHash));
const compiledCode = '5902eb010100229800aba2aba1aba0aab9faab9eaab9dab9a9bae0024888888896600264646644b30013370e900018039baa001899911991192cc004c04400626464646644b30013370e900018089baa0018992cc004c05c006264b3001300c375a602800f13322598009919800800a400044b30013370e01000314a313259800acc0056600266e2520c201001899b89001483d00629410174528c566002b3001337129030000c4cdc4800a40e514a080ba29462600a00280b901744cc00c00ccdc00012400514a080b8c00c0050164566002b300133710900000344cdc4803240fd14a080a22b30013371f3001006803c0217180138acc0066002b30013002300148002294626004600266e00019200140514a14a280a22b30013370e6eb4c05800d66002601c00d1483403e2b30013370e00c90024520c8018acc004cdc38032400d1480a22900a2028405080a2266e3cdd7180a801a4504646f7430008a50405114a080a22941014452820288a5040506e1d205a371c00d14a08090c0580062c80a0cc020dd5980a980b18091baa30153012375400291011cce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8008b2020337020026e34034c8cc004004dd6180a003112cc004006298103d87a80008992cc004cdd7980b18099baa30163013375400260146602a9811e581c21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35004bd7044c028cc0540052f5c113300300330170024044602a0028098dc68009bae300d00130100018b201c330023756601e602060200026eb8c03cc030dd500291192cc004c014c030dd5000c52f5bded8c1137566020601a6ea800500b1919800800801912cc004006298103d87a8000899192cc004cdc8802800c56600266e3c0140062600e66024602000497ae08a60103d87a80004039133004004301400340386eb8c038004c04400500f1807180718051baa300d006370e90011ba5480022c8030c024004c024c028004c024004c010dd5004c52689b2b20041';
const utilitytoken='ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8';
const provider = new BlockfrostProvider('preprodKuj8qUlJZk22ZQP9ap6kuQUpMhYBIUPf');
const paymentAddress2 = "addr_test1qqs3x03gl8uak59tjyfxl3qk83u322z35pqlqgv493fa5dt8y0pjhhc3hqj9cza9jw3cnd0nrxeuaul52hk95m94auhs2h5uku"; // Dirección a la que se enviarán los 10 ADA
function ipv4ToHex(ip: string): string {
  const octets = ip.split('.').map((octet) => parseInt(octet));
  const hexParts = octets.map((octet) => octet.toString(16).padStart(2, '0'));
  return hexParts.join('');
}
function ipv6ToHex(ip: string): string {
  if (ip.includes('::')) {
    const [left, right] = ip.split('::');
    const leftBlocks = left ? left.split(':') : [];
    const rightBlocks = right ? right.split(':') : [];
    const missingBlocksCount = 8 - (leftBlocks.length + rightBlocks.length);
    const missingBlocks = Array(missingBlocksCount).fill('0000');
    ip = [...leftBlocks, ...missingBlocks, ...rightBlocks].join(':');
  }
  const blocks = ip.split(':').map(block => block.padStart(4, '0'));
  return blocks.join('');
}

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);

  async function getAssets() {
    if (wallet) {
      setLoading(true);
const spendings="585c01010029800aba2aba1aab9eaab9dab9a4888896600264653001300600198031803800cc0180092225980099b8748008c01cdd500144c8cc892898050009805180580098041baa0028b200c180300098019baa0068a4d13656400401"
const tld=(document.getElementById('tld') as HTMLInputElement).value;
const domain=(document.getElementById('domain') as HTMLInputElement).value;
const fqdn=domain+tld;
const tokenNameHex=stringToHex(fqdn);
const utxos = await wallet.getUtxos();
const collateral = (await wallet.getCollateral())[0];
const changeAddress = await wallet.getChangeAddress();

  if (!utxos || utxos?.length === 0) {
    throw new Error("No utxos found");
  }
  if (!collateral) {
    throw new Error("No collateral found");
  }
  if (!changeAddress) {
    throw new Error("No wallet address found");
  }
const scriptCode = applyParamsToScript(
    compiledCode,
    [builtinByteString(stringToHex(tld))],
    "JSON"
  );
 const policyId = resolveScriptHash(scriptCode, "V3");


 const scriptspend = applyParamsToScript(
     spendings,
     [builtinByteString(policyId)],
     "JSON"
   );
  const paymentAddress = serializePlutusScript(
    { code: scriptspend, version: "V3" },
    undefined,
    0
  ).address;

const scriptCodeNS = applyParamsToScript(
    delegatorscript,
    [builtinByteString(policyId),builtinByteString(deserializeAddress(paymentAddress).scriptHash)],
    "JSON"
  );
 const policyIdNS = resolveScriptHash(scriptCodeNS, "V3");

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const firstUtxo = utxos[0];
const remainingUtxos = utxos.slice(1);
const unsignedTx = await txBuilder
   .txIn(
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      firstUtxo.output.amount,
      firstUtxo.output.address
    )
    .mintPlutusScript("V3")
    .mint("1", policyIdNS, tokenNameHex)
    .mintingScript(scriptCodeNS)
    .metadataValue(777,"")
    .mintRedeemerValue("")

    .txOut(
    paymentAddress,
    [
      {//we pay fee
        unit: utilitytoken + '646f7430', 
        quantity: "1",
      },
        { // WE SEND DELEGATION
        unit: policyIdNS + tokenNameHex,  // El NFT mintado
        quantity: "1",                  // Enviamos 1 NFT
      }
    ]
  )
    .txOutInlineDatumValue(stringToHex("8.8.8.8 8.8.8.8"))
//    .txOutInlineDatumValue("00"+ipv4ToHex("255.0.255.254")+ipv4ToHex("128.0.64.60")+ipv6ToHex("fe80::1")+ipv6ToHex("ff80::2"))
  .txOut(
    changeAddress,
    [
            { //SEND DOMAIN BACK TO USER
        unit: policyId + tokenNameHex,  // El NFT mintado
        quantity: "1",                  // Enviamos 1 NFT
      }
    ]
  )
    .changeAddress(changeAddress)
        .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .selectUtxosFrom(remainingUtxos)
    .complete();
//console.log(unsignedTx);
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
      setLoading(false);
    }
  }

  return (
    <div>
      <div>
      
            <input
        type="text"
        id="domain"
        placeholder="yourdomain"
      />
      <select id="tld">
      <option value=".d0.to">.d0.to</option>
      <option value=".ezz.to">.ezz.to</option>
      <option value=".ada.lat">.ada.lat</option>
      <option value=".crypto">.crypto</option>
    </select></div>
      <h1>Connect Wallet</h1>
      <CardanoWallet />
      {connected && (
        <>
          <h1>Register Domain</h1>
            <button
              type="button"
              onClick={() => getAssets()}
              disabled={loading}
              style={{
                margin: "8px",
                backgroundColor: loading ? "orange" : "grey",
              }}
            >
              Register Domain
            </button>
        </>
      )}
    </div>
  );
};

export default Home;
