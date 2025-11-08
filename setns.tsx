import { useState } from "react";
import type { NextPage } from "next";
import { useWallet,CardanoWallet } from '@meshsdk/react';
import { BlockfrostProvider,applyParamsToScript,MeshTxBuilder, resolveScriptHash, stringToHex, builtinByteString } from '@meshsdk/core';
import 'dotenv/config';

const delegatorscript="590306010100229800aba2aba1aba0aab9faab9eaab9dab9a9bae0024888888896600264653001300900198049805000cdc3a40009112cc004c004c020dd50014660026eb8c030c024dd50014c024dd51806002cdd2a4001370e900124444664465300133001375660266028602800600f3758602600d375860260069112cc004c05c00e2646644b3001300a00189991192cc004c044c060dd5000c4cc8966002602660346ea800626464b30013021001899912cc004c08c006264b30013371e6eb8c07c0040322b30013014375a604000315980099b8f375c603e00691104646f7430008980a1bad30200038a50407914a080f2294101e1811000c590201810000998071bab3007301d37540040291640786601a6eacc018c070dd5000a451cce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be800301e301b3754003164064603860326ea8004cc00801c8cdd7980e980d1baa301d301a3754002601e660389811e581c21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35004bd704590171980080311806992cc004c038c064dd5000c5200089bad301d301a375400280c0c966002601c60326ea8006298103d87a8000899198008009bab301e301b375400444b30010018a6103d87a8000899192cc004cdc8805000c56600266e3c0280062602666040603c00497ae08a60103d87a80004071133004004302200340706eb8c070004c07c00501d20303300b3756600660326ea80040588c068c06c00488c8cc00400400c896600200314c0103d87a80008992cc004c010006260206603a00297ae0899801801980f8012032301d001406d13370e0029000a028375c60260026eb4c050004c05800e2c80a04464b300130063011375400314bd6f7b63044dd5980a98091baa0014040660060040026022602200644646600200200644b30010018a60103d87a8000899192cc004cdc8802800c56600266e3c014006260106602a602600497ae08a60103d87a80004045133004004301700340446eb8c044004c05000501222c8038601200260086ea802629344d95900201";

const compiledCode = '5902eb010100229800aba2aba1aba0aab9faab9eaab9dab9a9bae0024888888896600264646644b30013370e900018039baa001899911991192cc004c04400626464646644b30013370e900018089baa0018992cc004c05c006264b3001300c375a602800f13322598009919800800a400044b30013370e01000314a313259800acc0056600266e2520c201001899b89001483d00629410174528c566002b3001337129030000c4cdc4800a40e514a080ba29462600a00280b901744cc00c00ccdc00012400514a080b8c00c0050164566002b300133710900000344cdc4803240fd14a080a22b30013371f3001006803c0217180138acc0066002b30013002300148002294626004600266e00019200140514a14a280a22b30013370e6eb4c05800d66002601c00d1483403e2b30013370e00c90024520c8018acc004cdc38032400d1480a22900a2028405080a2266e3cdd7180a801a4504646f7430008a50405114a080a22941014452820288a5040506e1d205a371c00d14a08090c0580062c80a0cc020dd5980a980b18091baa30153012375400291011cce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8008b2020337020026e34034c8cc004004dd6180a003112cc004006298103d87a80008992cc004cdd7980b18099baa30163013375400260146602a9811e581c21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35004bd7044c028cc0540052f5c113300300330170024044602a0028098dc68009bae300d00130100018b201c330023756601e602060200026eb8c03cc030dd500291192cc004c014c030dd5000c52f5bded8c1137566020601a6ea800500b1919800800801912cc004006298103d87a8000899192cc004cdc8802800c56600266e3c0140062600e66024602000497ae08a60103d87a80004039133004004301400340386eb8c038004c04400500f1807180718051baa300d006370e90011ba5480022c8030c024004c024c028004c024004c010dd5004c52689b2b20041';
const utilitytoken='ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8';
const paymentAddress = "addr_test1qqs3x03gl8uak59tjyfxl3qk83u322z35pqlqgv493fa5dt8y0pjhhc3hqj9cza9jw3cnd0nrxeuaul52hk95m94auhs2h5uku"; // Dirección a la que se enviarán los 10 ADA
const provider = new BlockfrostProvider('preprodKuj8qUlJZk22ZQP9ap6kuQUpMhYBIUPf');

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
const scriptCodeNS = applyParamsToScript(
    delegatorscript,
    [builtinByteString(policyId)],
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
  .txOut(
    changeAddress,
    [
            { //SEND DOMAIN BACK TO USER
        unit: policyId + tokenNameHex,  // El NFT mintado
        quantity: "1",                  // Enviamos 1 NFT
      }
    ]
  )
//    .txOutInlineDatumValue("00"+ipv4ToHex("255.0.255.254")+ipv4ToHex("128.0.64.60")+ipv6ToHex("fe80::1")+ipv6ToHex("ff80::2"))
    .txOutInlineDatumValue(stringToHex("ns1.afraid.org ns2.afraid.org"))
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
